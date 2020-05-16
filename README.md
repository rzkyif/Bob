# Bob
An extendable Line Bot that is built with a focus on modularity.

## Code Flow Explanation
1. Code in `bob.js` loads all plugins from `pluginDirectory` (default is "plugins").
2. Express client in `bob.js` receives callback from Line at route `/callback` with event information included.
3. The function `handleEvent(event)` is run on every event. Only events that are text messages are processed after this step.
4. Message is processed into `info` and `source` with the following structure:
```
info = {
	text, // message text
	command, // message's command part, if it's a command
	args // message's arguments, if it's a command
}
source = {
	type, // event's source type (either "group", "room", or "user")
	placeId, // event's source place id, only available when type is "group" or "room"
	userId // event's source user id, always available
}
```
5. If the message is a command type message (starts with `commandPrefix`, which is "." on default) , the message is handled by a single plugin's `handle(info, source)` function. 
The plugin that handles the message is the one one that has the message's command in it's `command` variable or in it's `alias` variable. These types of plugins are called **command handlers**.
6. If the event *doesn't* start with `commandPrefix`, then it is run through every plugin that has `command` variable set to `null`, which are called **message handlers**. 
Message processing stops when any of the plugin returns `final` = `true` or when every plugin has handled the event.
Plugins can also return `lock` = `true` to exclusively handle a user's message that is not a command.
7. All the result messages from all the `handle(info, source)` functions that are called is combined into one reply package and is then sent back as a reply.

