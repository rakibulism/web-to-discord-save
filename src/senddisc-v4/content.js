function injectSendButton ( img )
{
    if ( img.dataset.discordHoverAdded ) return; // prevent duplicates
    img.dataset.discordHoverAdded = "true";

    const btn = document.createElement( "button" );
    btn.textContent = "Send";
    btn.style.position = "absolute";
    btn.style.bottom = "8px";
    btn.style.right = "8px";
    btn.style.padding = "6px 10px";
    btn.style.fontSize = "12px";
    btn.style.background = "rgba(88, 101, 242, 0.9)";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    btn.style.display = "none";
    btn.style.zIndex = "99999";

    const wrapper = document.createElement( "div" );
    wrapper.style.position = "relative";
    img.parentNode.insertBefore( wrapper, img );
    wrapper.appendChild( img );
    wrapper.appendChild( btn );

    wrapper.addEventListener( "mouseenter", () => ( btn.style.display = "block" ) );
    wrapper.addEventListener( "mouseleave", () => ( btn.style.display = "none" ) );

    btn.addEventListener( "click", () =>
    {
        chrome.runtime.sendMessage( {
            action: "openPopover",
            imageUrl: img.src
        } );
    } );
}

// Scan for images dynamically
const observer = new MutationObserver( () =>
{
    document.querySelectorAll( "img" ).forEach( injectSendButton );
} );
observer.observe( document.body, { childList: true, subtree: true } );
document.querySelectorAll( "img" ).forEach( injectSendButton );
