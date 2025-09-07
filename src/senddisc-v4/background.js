chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) =>
{
    if ( message.type === "SEND_TO_DISCORD" )
    {
        chrome.storage.sync.get( [ "defaultChannel" ], ( { defaultChannel } ) =>
        {
            if ( !defaultChannel )
            {
                sendResponse( { error: "No default channel configured." } );
                return;
            }

            fetch( defaultChannel, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( {
                    content: message.comment || "",
                    embeds: [
                        {
                            title: "Saved from browser",
                            url: message.pageUrl,
                            image: message.mediaUrl ? { url: message.mediaUrl } : undefined
                        }
                    ]
                } )
            } )
                .then( () => sendResponse( { success: true } ) )
                .catch( err => sendResponse( { error: err.message } ) );

            return true; // keep message channel open
        } );
    }
} );
