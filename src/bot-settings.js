module.exports = {
    // When command is defined, bot will ignore restaurants key words in comuncation
    // and answer only to messages started with command
    // eg. "!lunch ostrava"
    command: "!lunch",

    // Use bot name instead of commnad
    // eg. "@lunchbot ostrava"
    useBotNameAsCommand: true,

    // Use simple key word with command
    // eg. "!lunch ostrava" but emoji will still works "!lunch :ostrava:"
    useSimpeKeyWordWithCommand: true,

    // Bot can reply in thread to not make mess in communication in the channel
    // Default is false,
    // when value is true, then all responses will be in new thread.
    // value could be also list of channel names
    replyInThread: ["nj-office"],

    // When command is used without parameter
    // bot could use dafault value for channel
    // eg. "!lunch" message in "ostrava-office" channel
    // will be the same as "!lunch ostrava"
    // for mapping:
    // channelDefault: {
    //   "ostrava-office": "ostrava"
    // }
    channelDefault: {
        "ostrava-office": "ostrava",
        "nj-office": "jicin"
    },

    // Channel ignore settings allow define ignored parameters for channel
    channelIgnore: {
        "ostrava-office": ["jicin"],
        "nj-office": ["ostrava"]
    }
}
