chrome.runtime.onMessage.addListener( ( msg, sender, sendResponse ) =>
{
    if ( msg.action === "openPopover" )
    {
        chrome.storage.sync.get( [ "webhook", "defaultChannel" ], ( data ) =>
        {
            if ( !data.webhook )
            {
                chrome.scripting.executeScript( {
                    target: { tabId: sender.tab.id },
                    func: () => alert( "❌ No webhook configured. Open the extension and set one." )
                } );
                return;
            }

            chrome.scripting.executeScript( {
                target: { tabId: sender.tab.id },
                func: ( imageUrl, channel ) =>
                {
                    const pop = document.createElement( "div" );
                    pop.style.position = "fixed";
                    pop.style.top = "50%";
                    pop.style.left = "50%";
                    pop.style.transform = "translate(-50%, -50%)";
                    pop.style.background = "#222";
                    pop.style.color = "#fff";
                    pop.style.padding = "16px";
                    pop.style.borderRadius = "8px";
                    pop.style.zIndex = "100000";
                    pop.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
                    pop.innerHTML = `
            <h3 style="margin:0 0 10px;">Send to Discord</h3>
            <p>Channel: <b>${ channel || "default" }</b></p>
            <textarea id="discordComment" rows="3" placeholder="Add a comment..." style="width:100%; margin-bottom:10px;"></textarea>
            <button id="discordSend">Send</button>
            <button id="discordClose">Close</button>
          `;
                    document.body.appendChild( pop );

                    document.getElementById( "discordSend" ).onclick = () =>
                    {
                        const comment = document.getElementById( "discordComment" ).value;
                        chrome.runtime.sendMessage( {
                            action: "sendToDiscord",
                            imageUrl,
                            comment,
                            channel
                        } );
                        pop.remove();
                    };
                    document.getElementById( "discordClose" ).onclick = () => pop.remove();
                },
                args: [ msg.imageUrl, data.defaultChannel || "" ]
            } );
        } );
    }

    if ( msg.action === "sendToDiscord" )
    {
        const { imageUrl, comment } = msg;
        chrome.storage.sync.get( [ "webhook" ], ( data ) =>
        {
            if ( !data.webhook ) return;

            fetch( data.webhook, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( {
                    content: comment || " ",
                    embeds: [ { image: { url: imageUrl } } ]
                } )
            } );
        } );
    }
} );
