cmake_minimum_required(VERSION 3.22)

# Project configuration
project(TimeStretchX VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Developer-friendly default: avoid requiring admin rights for post-build VST copy.
option(NODAW_COPY_PLUGIN_AFTER_BUILD "Copy built plugin to system VST folders after build" OFF)

# JUCE configuration - assumes JUCE is in ../JUCE or specify path
if(NOT DEFINED JUCE_PATH)
    set(JUCE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../JUCE")
endif()

if(EXISTS "${JUCE_PATH}/CMakeLists.txt")
    add_subdirectory(${JUCE_PATH} JUCE)
else()
    message(FATAL_ERROR "JUCE not found at ${JUCE_PATH}. Please set JUCE_PATH to your JUCE installation.")
endif()

# Plugin formats
set(FORMATS VST3 Standalone)
if(APPLE)
    list(APPEND FORMATS AU)
endif()

# Main plugin target
juce_add_plugin(TimeStretchX
    COMPANY_NAME "NoDAW Studio"
    COMPANY_WEBSITE "https://nodaw.studio"
    COMPANY_EMAIL "support@nodaw.studio"
    BUNDLE_ID "com.nodaw.timestretchx"
    
    PLUGIN_MANUFACTURER_CODE Ndaw
    PLUGIN_CODE TsX1
    
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    
    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD ${NODAW_COPY_PLUGIN_AFTER_BUILD}
    VST3_AUTO_MANIFEST FALSE

    FORMATS ${FORMATS}
    
    PRODUCT_NAME "Time Stretch X"
    
    # Icons - uncomment when icon files are added
    # ICON_BIG "${CMAKE_CURRENT_SOURCE_DIR}/Resources/Images/icon_512.png"
    # ICON_SMALL "${CMAKE_CURRENT_SOURCE_DIR}/Resources/Images/icon_128.png"
)

# Generate JUCE header
juce_generate_juce_header(TimeStretchX)

# Source files
target_sources(TimeStretchX
    PRIVATE
        # Main plugin files
        Source/PluginProcessor.cpp
        Source/PluginProcessor.h
        Source/PluginEditor.cpp
        Source/PluginEditor.h
        
        # DSP
        Source/DSP/TimeStretchEngine.cpp
        Source/DSP/TimeStretchEngine.h
        Source/DSP/NativeAudioGraph.cpp
        Source/DSP/NativeAudioGraph.h
        
        # UI Components
        Source/UI/LookAndFeel/NoDAWLookAndFeel.cpp
        Source/UI/LookAndFeel/NoDAWLookAndFeel.h
        Source/UI/LookAndFeel/Colours.h
        Source/UI/Components/DualKnob.cpp
        Source/UI/Components/DualKnob.h
        Source/UI/Components/WaveformDisplay.cpp
        Source/UI/Components/WaveformDisplay.h
        Source/UI/Components/AnimatedIcon.cpp
        Source/UI/Components/AnimatedIcon.h
        Source/UI/Components/AlgorithmSelector.cpp
        Source/UI/Components/AlgorithmSelector.h
        Source/UI/Components/PresetBrowser.cpp
        Source/UI/Components/PresetBrowser.h
        
        # State management
        Source/State/ParameterLayout.h
)

# Binary data (embedded resources) - optional, uncomment when fonts are added
# juce_add_binary_data(TimeStretchXData
#     HEADER_NAME "BinaryData.h"
#     NAMESPACE "BinaryData"
#     SOURCES
#         Resources/Fonts/Inter-Regular.ttf
#         Resources/Fonts/Inter-Bold.ttf
#         Resources/Fonts/JetBrainsMono-Regular.ttf
# )

# Compile definitions
target_compile_definitions(TimeStretchX
    PUBLIC
        JUCE_WEB_BROWSER=0
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
        JUCE_DISPLAY_SPLASH_SCREEN=0
        JUCE_MODAL_LOOPS_PERMITTED=1
        JUCE_STRICT_REFCOUNTEDPOINTER=1
)

# Compiler-specific optimizations
if(MSVC)
    # MSVC: Workaround VST3 SDK duplicate symbol issue
    target_compile_options(TimeStretchX PRIVATE /Zc:preprocessor)
endif()

# Include directories
target_include_directories(TimeStretchX
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/Source
)

# Link libraries
# juce_add_plugin wires up the plugin client and core module graph.
# Keep explicit links minimal to avoid duplicate VST3 SDK include trees.
target_link_libraries(TimeStretchX
    PRIVATE
        # TimeStretchXData  # Uncomment when binary data is enabled
        juce::juce_audio_utils
        juce::juce_dsp
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

# Platform-specific settings
if(APPLE)
    target_compile_options(TimeStretchX PRIVATE -Wno-deprecated-declarations)
elseif(MSVC)
    target_compile_options(TimeStretchX PRIVATE /W4 /WX-)
endif()

# Installation
install(TARGETS TimeStretchX
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    RUNTIME DESTINATION bin
)
