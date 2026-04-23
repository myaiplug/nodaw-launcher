/*
  ==============================================================================

    NativeAudioGraph.h
    JUCE-native graph runtime for Time Stretch X

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "TimeStretchEngine.h"
#include <array>
#include <atomic>
#include <map>
#include <memory>
#include <vector>

class NativeAudioGraph
{
public:
    enum class NodeType
    {
        TimeStretch,
        Pitch,
        Granular,
        Gain
    };

    struct Node
    {
        juce::String id;
        juce::String name;
        NodeType type = NodeType::Gain;
        juce::NamedValueSet params;
        int creationIndex = 0;
    };

    struct Connection
    {
        juce::String from;
        juce::String to;
    };

    struct ConnectionMeter
    {
        juce::String from;
        juce::String to;
        float level = 0.0f;
    };

    struct ProfilingSample
    {
        uint32_t blockSize = 0;
        uint32_t durationMicros = 0;
    };

    struct NodeRuntimeControl
    {
        virtual ~NodeRuntimeControl() = default;
        virtual void setParam(const juce::Identifier& key, juce::var value) = 0;
        virtual float getLastRms() const = 0;
    };

    bool createNode(const juce::String& id, NodeType type, const juce::String& name = {});
    bool removeNode(const juce::String& id);

    bool connect(const juce::String& from, const juce::String& to);
    bool disconnect(const juce::String& from, const juce::String& to);

    bool setParam(const juce::String& nodeId, const juce::Identifier& key, juce::var value);

    bool rebuildChain();
    void prepare(double sampleRate, int samplesPerBlock, int numChannels);
    void reset();
    void process(juce::AudioBuffer<float>& buffer);

    bool hasCycle() const { return cycleDetected; }
    const juce::StringArray& getExecutionOrder() const { return executionOrder; }
    const juce::Array<Connection>& getConnections() const { return connections; }
    std::vector<ConnectionMeter> getConnectionMeters() const;
    std::vector<ProfilingSample> drainProfilingSamples();

private:
    struct ProfilingRingBuffer
    {
        juce::AbstractFifo fifo { 512 };
        std::array<ProfilingSample, 512> samples {};
    };

    juce::Array<Node> nodes;
    juce::Array<Connection> connections;

    juce::StringArray executionOrder;
    juce::StringArray lastValidExecutionOrder;
    bool cycleDetected = false;
    int nextCreationIndex = 0;

    std::unique_ptr<juce::AudioProcessorGraph> graph;
    std::map<juce::String, juce::AudioProcessorGraph::Node::Ptr> graphNodes;
    std::map<juce::String, NodeRuntimeControl*> runtimeControls;
    juce::AudioProcessorGraph::Node::Ptr graphInputNode;
    juce::AudioProcessorGraph::Node::Ptr graphOutputNode;
    ProfilingRingBuffer profilingRing;
    mutable juce::SpinLock graphAccessLock;

    double currentSampleRate = 44100.0;
    int currentBlockSize = 512;
    int currentNumChannels = 2;
    bool prepared = false;

    Node* findNode(const juce::String& id);
    const Node* findNode(const juce::String& id) const;

    void rebuildProcessorGraph();
    std::unique_ptr<juce::AudioProcessor> createProcessorForNode(const Node& node);
    void pushProfilingSample(uint32_t blockSize, uint32_t durationMicros);
    void updateConnectionMeters();

    static int typeSortKey(NodeType type);
};
