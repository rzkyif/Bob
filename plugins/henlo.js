function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text' || !event.message.text.startsWith('henlo') ) {
      return { final: false };
    }
  
    const reply = { type: 'text', text: 'henlo too, ' + event.message.text.slice(5) };
  
    return { reply: reply, final: true };
}
exports.handleEvent = handleEvent;