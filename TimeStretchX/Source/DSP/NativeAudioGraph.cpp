/*
  ==============================================================================

    NativeAudioGraph.cpp
    JUCE-native graph runtime for Time Stretch X

  ==============================================================================
*/

#include "NativeAudioGraph.h"

#include <algorithm>
#include <cmath>

namespace
{
static constexpr auto kTimeRatio = "timeRatio";
static constexpr auto kPitchShift = "pitchShift";
static constexpr auto kFormantShift = "formantShift";
static constexpr auto kAlgorithm = "algorithm";
static constexpr auto kQuality = "quality";
static constexpr auto kKeyLock = "keyLock";
static constexpr auto kGrainSizeMs = "grainSizeMs";
static constexpr auto kGrainDensity = "grainDensity";
static constexpr auto kGain = "gain";

class TimeStretchNodeProcessor final : public juce::AudioProcessor,
                                       public NativeAudioGraph::NodeRuntimeControl
{
public:
    explicit TimeStretchNodeProcessor(NativeAudioGraph::NodeType t)
        : AudioProcessor(BusesProperties()
                             .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                             .withOutput ("Output", juce::AudioChannelSet::stereo(), true)),
          type(t)
    {
    }

    const juce::String getName() const override { return "NativeTimeStretchNode"; }
    void prepareToPlay(double sampleRate, int samplesPerBlock) override
    {
        engine.prepare(sampleRate, samplesPerBlock, getTotalNumOutputChannels());
    }
    void releaseResources() override { engine.reset(); }
    void processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&) override
    {
        if (type == NativeAudioGraph::NodeType::TimeStretch)
        {
            engine.setAlgorithm(algorithm.load());
            engine.setTimeStretch(timeRatio.load());
            engine.setPitchShift(pitchShift.load());
            engine.setFormantShift(formantShift.load());
            engine.setQuality(quality.load());
            engine.setKeyLock(keyLock.load() > 0.5f);
        }
        else if (type == NativeAudioGraph::NodeType::Pitch)
        {
            engine.setAlgorithm(0);
            engine.setTimeStretch(1.0f);
            engine.setPitchShift(pitchShift.load());
            engine.setQuality(quality.load());
            engine.setKeyLock(false);
        }
        else
        {
            engine.setAlgorithm(1);
            engine.setTimeStretch(timeRatio.load());
            engine.setPitchShift(pitchShift.load());
            engine.setGrainSize(grainSizeMs.load());
            engine.setGrainDensity(grainDensity.load());
            engine.setQuality(quality.load());
            engine.setKeyLock(false);
        }

        engine.process(buffer);

        float rms = 0.0f;
        for (int ch = 0; ch < buffer.getNumChannels(); ++ch)
            rms += buffer.getRMSLevel(ch, 0, buffer.getNumSamples());
        lastRms.store(buffer.getNumChannels() > 0 ? rms / static_cast<float>(buffer.getNumChannels()) : 0.0f,
                      std::memory_order_relaxed);
    }

    bool isBusesLayoutSupported(const BusesLayout& layouts) const override
    {
        return layouts.getMainInputChannelSet() == layouts.getMainOutputChannelSet();
    }

    juce::AudioProcessorEditor* createEditor() override { return nullptr; }
    bool hasEditor() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const juce::String getProgramName(int) override { return {}; }
    void changeProgramName(int, const juce::String&) override {}
    void getStateInformation(juce::MemoryBlock&) override {}
    void setStateInformation(const void*, int) override {}

    void setParam(const juce::Identifier& key, juce::var value) override
    {
        if (key == juce::Identifier(kTimeRatio))
            timeRatio.store(static_cast<float>(value), std::memory_order_relaxed);
        else if (key == juce::Identifier(kPitchShift))
            pitchShift.store(static_cast<float>(value), std::memory_order_relaxed);
        else if (key == juce::Identifier(kFormantShift))
            formantShift.store(static_cast<float>(value), std::memory_order_relaxed);
        else if (key == juce::Identifier(kAlgorithm))
            algorithm.store(static_cast<int>(value), std::memory_order_relaxed);
        else if (key == juce::Identifier(kQuality))
            quality.store(static_cast<int>(value), std::memory_order_relaxed);
        else if (key == juce::Identifier(kKeyLock))
            keyLock.store(static_cast<float>(value), std::memory_order_relaxed);
        else if (key == juce::Identifier(kGrainSizeMs))
            grainSizeMs.store(static_cast<float>(value), std::memory_order_relaxed);
        else if (key == juce::Identifier(kGrainDensity))
            grainDensity.store(static_cast<float>(value), std::memory_order_relaxed);
    }

    float getLastRms() const override
    {
        return lastRms.load(std::memory_order_relaxed);
    }

private:
    NativeAudioGraph::NodeType type;
    TimeStretchEngine engine;

    std::atomic<float> timeRatio { 1.0f };
    std::atomic<float> pitchShift { 0.0f };
    std::atomic<float> formantShift { 0.0f };
    std::atomic<float> keyLock { 1.0f };
    std::atomic<float> grainSizeMs { 100.0f };
    std::atomic<float> grainDensity { 20.0f };
    std::atomic<int> algorithm { 0 };
    std::atomic<int> quality { 3 };
    std::atomic<float> lastRms { 0.0f };
};

class GainNodeProcessor final : public juce::AudioProcessor,
                                public NativeAudioGraph::NodeRuntimeControl
{
public:
    GainNodeProcessor()
        : AudioProcessor(BusesProperties()
                             .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                             .withOutput ("Output", juce::AudioChannelSet::stereo(), true))
    {
    }

    const juce::String getName() const override { return "NativeGainNode"; }
    void prepareToPlay(double, int) override {}
    void releaseResources() override {}
    void processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&) override
    {
        const float g = gain.load(std::memory_order_relaxed);
        if (std::abs(g - 1.0f) > 0.0001f)
            buffer.applyGain(g);

        float rms = 0.0f;
        for (int ch = 0; ch < buffer.getNumChannels(); ++ch)
            rms += buffer.getRMSLevel(ch, 0, buffer.getNumSamples());
        lastRms.store(buffer.getNumChannels() > 0 ? rms / static_cast<float>(buffer.getNumChannels()) : 0.0f,
                      std::memory_order_relaxed);
    }

    bool isBusesLayoutSupported(const BusesLayout& layouts) const override
    {
        return layouts.getMainInputChannelSet() == layouts.getMainOutputChannelSet();
    }

    juce::AudioProcessorEditor* createEditor() override { return nullptr; }
    bool hasEditor() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const juce::String getProgramName(int) override { return {}; }
    void changeProgramName(int, const juce::String&) override {}
    void getStateInformation(juce::MemoryBlock&) override {}
    void setStateInformation(const void*, int) override {}

    void setParam(const juce::Identifier& key, juce::var value) override
    {
        if (key == juce::Identifier(kGain))
            gain.store(static_cast<float>(value), std::memory_order_relaxed);
    }

    float getLastRms() const override
    {
        return lastRms.load(std::memory_order_relaxed);
    }

private:
    std::atomic<float> gain { 1.0f };
    std::atomic<float> lastRms { 0.0f };
};
}

NativeAudioGraph::Node* NativeAudioGraph::findNode(const juce::String& id)
{
    for (auto& node : nodes)
        if (node.id == id)
            return &node;

    return nullptr;
}

const NativeAudioGraph::Node* NativeAudioGraph::findNode(const juce::String& id) const
{
    for (const auto& node : nodes)
        if (node.id == id)
            return &node;

    return nullptr;
}

int NativeAudioGraph::typeSortKey(NodeType type)
{
    switch (type)
    {
        case NodeType::TimeStretch: return 0;
        case NodeType::Pitch:       return 1;
        case NodeType::Granular:    return 2;
        case NodeType::Gain:        return 3;
        default:                    return 100;
    }
}

bool NativeAudioGraph::createNode(const juce::String& id, NodeType type, const juce::String& name)
{
    if (id.isEmpty() || findNode(id) != nullptr)
        return false;

    Node node;
    node.id = id;
    node.type = type;
    node.name = name.isNotEmpty() ? name : id;
    node.creationIndex = nextCreationIndex++;

    if (type == NodeType::TimeStretch)
    {
        node.params.set(kTimeRatio, 1.0f);
        node.params.set(kPitchShift, 0.0f);
        node.params.set(kFormantShift, 0.0f);
        node.params.set(kAlgorithm, 0);
        node.params.set(kQuality, 3);
        node.params.set(kKeyLock, 1.0f);
    }
    else if (type == NodeType::Pitch)
    {
        node.params.set(kPitchShift, 0.0f);
        node.params.set(kQuality, 3);
    }
    else if (type == NodeType::Granular)
    {
        node.params.set(kTimeRatio, 1.0f);
        node.params.set(kPitchShift, 0.0f);
        node.params.set(kGrainSizeMs, 100.0f);
        node.params.set(kGrainDensity, 20.0f);
    }
    else
    {
        node.params.set(kGain, 1.0f);
    }

    nodes.add(std::move(node));
    if (rebuildChain())
        return true;

    for (int i = nodes.size() - 1; i >= 0; --i)
    {
        if (nodes.getReference(i).id == id)
        {
            nodes.remove(i);
            break;
        }
    }

    rebuildChain();
    return false;
}

bool NativeAudioGraph::removeNode(const juce::String& id)
{
    bool removed = false;
    for (int i = nodes.size() - 1; i >= 0; --i)
    {
        if (nodes.getReference(i).id == id)
        {
            nodes.remove(i);
            removed = true;
            break;
        }
    }

    if (!removed)
        return false;

    for (int i = connections.size() - 1; i >= 0; --i)
    {
        const auto& c = connections.getReference(i);
        if (c.from == id || c.to == id)
            connections.remove(i);
    }

    return rebuildChain();
}

bool NativeAudioGraph::connect(const juce::String& from, const juce::String& to)
{
    if (from == to || findNode(from) == nullptr || findNode(to) == nullptr)
        return false;

    for (const auto& c : connections)
        if (c.from == from && c.to == to)
            return true;

    connections.add({ from, to });
    if (rebuildChain())
        return true;

    for (int i = connections.size() - 1; i >= 0; --i)
    {
        const auto& c = connections.getReference(i);
        if (c.from == from && c.to == to)
        {
            connections.remove(i);
            break;
        }
    }

    rebuildChain();
    return false;
}

bool NativeAudioGraph::disconnect(const juce::String& from, const juce::String& to)
{
    for (int i = connections.size() - 1; i >= 0; --i)
    {
        const auto& c = connections.getReference(i);
        if (c.from == from && c.to == to)
            connections.remove(i);
    }

    return rebuildChain();
}

bool NativeAudioGraph::setParam(const juce::String& nodeId, const juce::Identifier& key, juce::var value)
{
    const juce::SpinLock::ScopedLockType lock(graphAccessLock);

    auto* node = findNode(nodeId);
    if (node == nullptr)
        return false;

    node->params.set(key, value);

    if (auto it = runtimeControls.find(nodeId); it != runtimeControls.end() && it->second != nullptr)
        it->second->setParam(key, value);

    return true;
}

bool NativeAudioGraph::rebuildChain()
{
    executionOrder.clear();

    if (nodes.isEmpty())
    {
        cycleDetected = false;
        rebuildProcessorGraph();
        return true;
    }

    juce::HashMap<juce::String, int> indegree;
    juce::HashMap<juce::String, juce::StringArray> outgoing;

    for (const auto& n : nodes)
    {
        indegree.set(n.id, 0);
        outgoing.set(n.id, {});
    }

    for (const auto& c : connections)
    {
        if (findNode(c.from) == nullptr || findNode(c.to) == nullptr)
            continue;

        auto outs = outgoing[c.from];
        outs.addIfNotAlreadyThere(c.to);
        outgoing.set(c.from, outs);
        indegree.set(c.to, indegree[c.to] + 1);
    }

    juce::Array<const Node*> zeroIn;
    for (const auto& n : nodes)
    {
        if (indegree[n.id] == 0)
            zeroIn.add(&n);
    }

    std::sort(zeroIn.begin(), zeroIn.end(), [](const Node* a, const Node* b)
    {
        if (a->creationIndex != b->creationIndex)
            return a->creationIndex < b->creationIndex;

        if (typeSortKey(a->type) != typeSortKey(b->type))
            return typeSortKey(a->type) < typeSortKey(b->type);

        return a->id.compareNatural(b->id) < 0;
    });

    juce::StringArray order;

    while (!zeroIn.isEmpty())
    {
        const Node* current = zeroIn.removeAndReturn(0);
        order.add(current->id);

        auto outs = outgoing[current->id];
        std::sort(outs.begin(), outs.end(), [](const juce::String& a, const juce::String& b)
        {
            return a.compareNatural(b) < 0;
        });

        for (const auto& target : outs)
        {
            const int next = indegree[target] - 1;
            indegree.set(target, next);

            if (next == 0)
            {
                if (const auto* targetNode = findNode(target))
                    zeroIn.add(targetNode);
            }
        }

        std::sort(zeroIn.begin(), zeroIn.end(), [](const Node* a, const Node* b)
        {
            if (a->creationIndex != b->creationIndex)
                return a->creationIndex < b->creationIndex;

            if (typeSortKey(a->type) != typeSortKey(b->type))
                return typeSortKey(a->type) < typeSortKey(b->type);

            return a->id.compareNatural(b->id) < 0;
        });
    }

    cycleDetected = (order.size() != nodes.size());

    if (cycleDetected)
    {
        if (!lastValidExecutionOrder.isEmpty())
            executionOrder = lastValidExecutionOrder;
        else
            for (const auto& n : nodes)
                executionOrder.add(n.id);

        return false;
    }

    executionOrder = order;
    lastValidExecutionOrder = order;

    rebuildProcessorGraph();
    return true;
}

void NativeAudioGraph::prepare(double sampleRate, int samplesPerBlock, int numChannels)
{
    currentSampleRate = sampleRate;
    currentBlockSize = samplesPerBlock;
    currentNumChannels = juce::jmax(1, numChannels);
    prepared = true;

    rebuildProcessorGraph();
}

void NativeAudioGraph::reset()
{
    const juce::SpinLock::ScopedLockType lock(graphAccessLock);
    if (graph != nullptr)
        graph->reset();
}

void NativeAudioGraph::process(juce::AudioBuffer<float>& buffer)
{
    const juce::SpinLock::ScopedTryLockType lock(graphAccessLock);
    if (!lock.isLocked() || graph == nullptr)
        return;

    const auto started = juce::Time::getHighResolutionTicks();

    juce::MidiBuffer midi;
    graph->processBlock(buffer, midi);

    updateConnectionMeters();

    const auto ended = juce::Time::getHighResolutionTicks();
    const auto micros = static_cast<uint32_t>(juce::Time::highResolutionTicksToSeconds(ended - started) * 1000000.0);
    pushProfilingSample(static_cast<uint32_t>(buffer.getNumSamples()), micros);
}

std::vector<NativeAudioGraph::ConnectionMeter> NativeAudioGraph::getConnectionMeters() const
{
    const juce::SpinLock::ScopedLockType lock(graphAccessLock);

    std::vector<ConnectionMeter> meters;
    meters.reserve(static_cast<size_t>(connections.size()));

    for (int i = 0; i < connections.size(); ++i)
    {
        const auto& c = connections.getReference(i);
        float level = 0.0f;
        if (auto it = runtimeControls.find(c.from); it != runtimeControls.end() && it->second != nullptr)
            level = juce::jlimit(0.0f, 1.0f, it->second->getLastRms());

        meters.push_back({ c.from, c.to, level });
    }

    return meters;
}

std::vector<NativeAudioGraph::ProfilingSample> NativeAudioGraph::drainProfilingSamples()
{
    std::vector<ProfilingSample> drained;

    int start1 = 0, size1 = 0, start2 = 0, size2 = 0;
    profilingRing.fifo.prepareToRead(profilingRing.fifo.getNumReady(), start1, size1, start2, size2);

    drained.reserve(static_cast<size_t>(size1 + size2));
    for (int i = 0; i < size1; ++i)
        drained.push_back(profilingRing.samples[static_cast<size_t>(start1 + i)]);
    for (int i = 0; i < size2; ++i)
        drained.push_back(profilingRing.samples[static_cast<size_t>(start2 + i)]);

    profilingRing.fifo.finishedRead(size1 + size2);
    return drained;
}

std::unique_ptr<juce::AudioProcessor> NativeAudioGraph::createProcessorForNode(const Node& node)
{
    if (node.type == NodeType::Gain)
        return std::make_unique<GainNodeProcessor>();

    return std::make_unique<TimeStretchNodeProcessor>(node.type);
}

void NativeAudioGraph::rebuildProcessorGraph()
{
    if (cycleDetected)
        return;

    const juce::SpinLock::ScopedLockType lock(graphAccessLock);

    graphNodes.clear();
    runtimeControls.clear();

    graph = std::make_unique<juce::AudioProcessorGraph>();

    graphInputNode = graph->addNode(std::make_unique<juce::AudioProcessorGraph::AudioGraphIOProcessor>(
        juce::AudioProcessorGraph::AudioGraphIOProcessor::audioInputNode));
    graphOutputNode = graph->addNode(std::make_unique<juce::AudioProcessorGraph::AudioGraphIOProcessor>(
        juce::AudioProcessorGraph::AudioGraphIOProcessor::audioOutputNode));

    if (nodes.isEmpty())
    {
        for (int ch = 0; ch < currentNumChannels; ++ch)
            graph->addConnection({ { graphInputNode->nodeID, ch }, { graphOutputNode->nodeID, ch } });

        if (prepared)
            graph->prepareToPlay(currentSampleRate, currentBlockSize);

        return;
    }

    for (const auto& nodeId : executionOrder)
    {
        const auto* node = findNode(nodeId);
        if (node == nullptr)
            continue;

        auto processor = createProcessorForNode(*node);
        auto addedNode = graph->addNode(std::move(processor));
        if (addedNode == nullptr)
            continue;

        graphNodes[nodeId] = addedNode;
        if (auto* control = dynamic_cast<NodeRuntimeControl*>(addedNode->getProcessor()))
        {
            runtimeControls[nodeId] = control;
            for (int pi = 0; pi < node->params.size(); ++pi)
            {
                const auto key = node->params.getName(pi);
                control->setParam(key, node->params.getValueAt(pi));
            }
        }
    }

    juce::HashMap<juce::String, int> indegree;
    juce::HashMap<juce::String, int> outdegree;
    for (const auto& n : nodes)
    {
        indegree.set(n.id, 0);
        outdegree.set(n.id, 0);
    }

    for (const auto& c : connections)
    {
        if (graphNodes.find(c.from) == graphNodes.end() || graphNodes.find(c.to) == graphNodes.end())
            continue;

        indegree.set(c.to, indegree[c.to] + 1);
        outdegree.set(c.from, outdegree[c.from] + 1);

        for (int ch = 0; ch < currentNumChannels; ++ch)
        {
            graph->addConnection({ { graphNodes[c.from]->nodeID, ch }, { graphNodes[c.to]->nodeID, ch } });
        }
    }

    for (const auto& n : nodes)
    {
        if (graphNodes.find(n.id) == graphNodes.end())
            continue;

        if (indegree[n.id] == 0)
        {
            for (int ch = 0; ch < currentNumChannels; ++ch)
                graph->addConnection({ { graphInputNode->nodeID, ch }, { graphNodes[n.id]->nodeID, ch } });
        }

        if (outdegree[n.id] == 0)
        {
            for (int ch = 0; ch < currentNumChannels; ++ch)
                graph->addConnection({ { graphNodes[n.id]->nodeID, ch }, { graphOutputNode->nodeID, ch } });
        }
    }

    if (prepared)
        graph->prepareToPlay(currentSampleRate, currentBlockSize);

}

void NativeAudioGraph::pushProfilingSample(uint32_t blockSize, uint32_t durationMicros)
{
    int start1 = 0, size1 = 0, start2 = 0, size2 = 0;
    profilingRing.fifo.prepareToWrite(1, start1, size1, start2, size2);

    if (size1 > 0)
        profilingRing.samples[static_cast<size_t>(start1)] = { blockSize, durationMicros };

    profilingRing.fifo.finishedWrite(size1);
}

void NativeAudioGraph::updateConnectionMeters()
{
    // Meters are read lock-free from runtime control atomics.
}
