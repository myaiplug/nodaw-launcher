cmake_minimum_required(VERSION 3.22)

project(RepairIT VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

option(NODAW_COPY_PLUGIN_AFTER_BUILD "Copy built plugin to system VST folders after build" OFF)

if(NOT DEFINED JUCE_PATH)
    set(JUCE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../JUCE")
endif()

if(EXISTS "${JUCE_PATH}/CMakeLists.txt")
    add_subdirectory(${JUCE_PATH} JUCE)
else()
    message(FATAL_ERROR "JUCE not found at ${JUCE_PATH}. Please set JUCE_PATH to your JUCE installation.")
endif()

set(FORMATS VST3 Standalone)
if(APPLE)
    list(APPEND FORMATS AU)
endif()

juce_add_plugin(RepairIT
    COMPANY_NAME "NoDAW Studio"
    COMPANY_WEBSITE "https://nodaw.studio"
    COMPANY_EMAIL "support@nodaw.studio"
    BUNDLE_ID "com.nodaw.repairit"

    PLUGIN_MANUFACTURER_CODE Ndaw
    PLUGIN_CODE RpI1

    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE

    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD ${NODAW_COPY_PLUGIN_AFTER_BUILD}
    VST3_AUTO_MANIFEST FALSE

    FORMATS ${FORMATS}
    PRODUCT_NAME "Repair-IT"
)

juce_generate_juce_header(RepairIT)

target_sources(RepairIT
    PRIVATE
        Source/PluginProcessor.cpp
        Source/PluginProcessor.h
        Source/PluginEditor.cpp
        Source/PluginEditor.h
        Source/State/ParameterLayout.h
)

target_compile_definitions(RepairIT
    PUBLIC
        JUCE_WEB_BROWSER=0
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
        JUCE_DISPLAY_SPLASH_SCREEN=0
)

target_include_directories(RepairIT PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/Source)

target_link_libraries(RepairIT
    PRIVATE
        juce::juce_audio_utils
        juce::juce_dsp
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)
