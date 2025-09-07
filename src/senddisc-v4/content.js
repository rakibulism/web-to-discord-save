// content.js

let lastClickedMedia = null;
let popover = null;

function createPopoverForElement ( target, mediaUrl, mediaType )
{
    removePopover();
    popover = document.createElement( 'div' );
    popover.style.position = 'absolute';
    popover.style.zIndex = 2147483647;
    popover.style.minWidth = '300px';
    popover.style.maxWidth = '360px';
    popover.style.background = '#0f0f12';
    popover.style.border = '1px solid rgba(255,255,255,0.06)';
    popover.style.color = '#cfcfcf';
    popover.style.borderRadius = '8px';
    popover.style.boxShadow = '0 8px 30px rgba(2,6,23,0.7)';
    popover.style.padding = '8px';
    popover.style.fontFamily = 'Inter, Roboto, Arial, sans-serif';
    popover.innerHTML = `
    <div style="font-weight:600;margin-bottom:6px">Save to Discord</div>
    <div style="font-size:12px;color:#9aa1a8;margin-bottom:8px">Media: ${ mediaType }</div>
    <textarea id="ext_msg" placeholder="Add a comment..." style="width:100%;height:60px;background:#0b0b0d;border:1px solid #222;color:#cfcfcf;padding:6px;border-radius:6px"></textarea>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button id="ext_send" style="flex:1;background:#4ea8ff;border-radius:6px;padding:8px;border:0;cursor:pointer">Send</button>
      <button id="ext_cancel" style="background:#2e2e33;border-radius:6px;padding:8px;border:0;color:#cfcfcf;cursor:pointer">Close</button>
    </div>
    <div style="margin-top:6px;font-size:12px;color:#9aa1a8">Pick channel from extension icon popup or use default channel.</div>
  `;
    document.body.appendChild( popover );

    // position near target
    const rect = target.getBoundingClientRect();
    let top = window.scrollY + rect.top - popover.offsetHeight - 8;
    if ( top < window.scrollY ) top = window.scrollY + rect.bottom + 8;
    let left = window.scrollX + rect.left;
    if ( left + popover.offsetWidth > window.scrollX + document.documentElement.clientWidth )
    {
        left = window.scrollX + document.documentElement.clientWidth - popover.offsetWidth - 8;
    }
    popover.style.top = `${ top }px`;
    popover.style.left = `${ left }px`;

    document.getElementById( 'ext_cancel' ).addEventListener( 'click', removePopover );
    document.getElementById( 'ext_send' ).addEventListener( 'click', async () =>
    {
        const text = document.getElementById( 'ext_msg' ).value || '';
        // send message to background; background will use default channel if stored
        chrome.runtime.sendMessage( {
            type: 'sendFromContent',
            message: text,
            media: { url: mediaUrl, type: mediaType },
            page: { title: document.title, url: location.href }
        }, ( resp ) =>
        {
            // quick feedback
            if ( resp && resp.message )
            {
                alert( resp.message );
            } else
            {
                alert( 'Sent (or attempted).' );
            }
            removePopover();
        } );
    } );
}

function removePopover ()
{
    if ( popover && popover.parentNode ) popover.parentNode.removeChild( popover );
    popover = null;
}

document.addEventListener( 'click', ( e ) =>
{
    // if click on image or video element (or inside it)
    const el = e.target.closest( 'img,video' );
    if ( !el ) return;
    e.preventDefault();
    e.stopPropagation();

    let src = null;
    let type = 'unknown';
    if ( el.tagName.toLowerCase() === 'img' )
    {
        src = el.currentSrc || el.src;
        type = 'image';
    } else if ( el.tagName.toLowerCase() === 'video' )
    {
        src = el.currentSrc || el.src || ( el.querySelector( 'source' ) && el.querySelector( 'source' ).src ) || location.href;
        type = 'video';
    }
    lastClickedMedia = { url: src, type };
    createPopoverForElement( el, src, type );
}, true );

// hide popover on escape or click elsewhere
document.addEventListener( 'keydown', ( e ) =>
{
    if ( e.key === 'Escape' ) removePopover();
} );
document.addEventListener( 'click', ( e ) =>
{
    if ( popover && !popover.contains( e.target ) )
    {
        // but clicking an image created it — we don't want to immediately close
        // so only close if click is outside and not on an image/video
        if ( !e.target.closest( 'img,video' ) ) removePopover();
    }
}, true );

// respond to popup asking last clicked media
chrome.runtime.onMessage.addListener( ( msg, sender, sendResp ) =>
{
    if ( msg && msg.type === 'getLastClickedMedia' )
    {
        sendResp( { media: lastClickedMedia } );
    }
} );
