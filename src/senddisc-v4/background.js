// background.js

// helper to fetch saved channels & default
async function getChannels ()
{
    const data = await chrome.storage.local.get( { channels: [], defaultChannel: null } );
    return data;
}

async function postToWebhook ( webhook, body )
{
    try
    {
        const res = await fetch( webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( body )
        } );
        if ( !res.ok )
        {
            const text = await res.text();
            return { ok: false, status: res.status, text };
        }
        return { ok: true, status: res.status };
    } catch ( err )
    {
        return { ok: false, error: err.message };
    }
}

chrome.runtime.onMessage.addListener( ( msg, sender, sendResp ) =>
{
    if ( msg && ( msg.type === 'send' || msg.type === 'sendFromContent' ) )
    {
        ( async () =>
        {
            const { channels, defaultChannel } = await getChannels();
            let webhook = msg.webhook;
            // if sendFromContent: choose default channel
            if ( msg.type === 'sendFromContent' )
            {
                if ( !defaultChannel )
                {
                    sendResp( { message: 'No default channel configured. Open the extension and set a default channel.' } );
                    return;
                }
                const ch = ( channels || [] ).find( c => c.id === defaultChannel );
                if ( !ch )
                {
                    sendResp( { message: 'Default channel not found. Please re-configure.' } );
                    return;
                }
                webhook = ch.webhook;
            }

            if ( !webhook )
            {
                sendResp( { message: 'No webhook provided.' } );
                return;
            }

            // build payload for Discord webhook
            // Use content (plain text) + embed for page and image
            const contentText = msg.content || msg.message || '';
            const embeds = [];
            // page embed
            if ( msg.page )
            {
                embeds.push( {
                    title: msg.page.title || undefined,
                    url: msg.page.url || undefined,
                    description: msg.content || '',
                } );
            }
            // media
            if ( msg.media )
            {
                if ( msg.media.type === 'image' && msg.media.url )
                {
                    // put into embed image
                    embeds.push( {
                        image: { url: msg.media.url },
                        description: `Media: ${ msg.media.type }`
                    } );
                } else if ( msg.media.type === 'video' )
                {
                    // video isn't directly embeddable by URL in webhook embed for all cases; include url in content or embed
                    embeds.push( {
                        description: `Video: ${ msg.media.url }`
                    } );
                }
            }

            const body = {};
            if ( contentText ) body.content = contentText;
            if ( embeds.length ) body.embeds = embeds;

            const r = await postToWebhook( webhook, body );
            if ( r.ok )
            {
                sendResp( { message: 'Sent successfully' } );
            } else
            {
                sendResp( { message: 'Failed to send: ' + ( r.error || ( r.status + ' ' + ( r.text || '' ) ) ) } );
            }
        } )();
        // indicate we'll call sendResp asynchronously
        return true;
    }

    // if popup or content asks for something else, ignore
} );
