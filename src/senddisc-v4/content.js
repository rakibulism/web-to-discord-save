// Add a hover "send" icon on images
document.addEventListener( "mouseover", ( event ) =>
{
    const target = event.target;

    if ( target.tagName === "IMG" && !target.dataset.discordHover )
    {
        target.dataset.discordHover = "true";

        const sendBtn = document.createElement( "div" );
        sendBtn.innerText = "⇪"; // you can replace with an icon
        sendBtn.className = "discord-send-btn";

        // position inside image
        sendBtn.style.position = "absolute";
        sendBtn.style.top = "8px";
        sendBtn.style.right = "8px";
        sendBtn.style.background = "rgba(0,0,0,0.6)";
        sendBtn.style.color = "#fff";
        sendBtn.style.padding = "4px 6px";
        sendBtn.style.cursor = "pointer";
        sendBtn.style.fontSize = "14px";
        sendBtn.style.borderRadius = "4px";
        sendBtn.style.zIndex = "9999";

        target.style.position = "relative"; // ensure positioning
        target.parentElement.style.position = "relative";
        target.parentElement.appendChild( sendBtn );

        sendBtn.addEventListener( "click", () =>
        {
            showPopover( target.src );
        } );
    }
} );

function showPopover ( mediaUrl )
{
    // Remove existing
    document.querySelectorAll( ".discord-popover" ).forEach( p => p.remove() );

    const pop = document.createElement( "div" );
    pop.className = "discord-popover";
    pop.innerHTML = `
    <div class="discord-popover-header">Save to Discord</div>
    <textarea id="discord-comment" placeholder="Add a comment..."></textarea>
    <div class="discord-popover-actions">
      <button id="discord-send">Send</button>
      <button id="discord-close">Close</button>
    </div>
  `;

    document.body.appendChild( pop );

    document.getElementById( "discord-close" ).onclick = () => pop.remove();
    document.getElementById( "discord-send" ).onclick = () =>
    {
        const comment = document.getElementById( "discord-comment" ).value;
        chrome.runtime.sendMessage(
            { type: "SEND_TO_DISCORD", mediaUrl, pageUrl: location.href, comment },
            ( res ) =>
            {
                if ( res?.error )
                {
                    alert( res.error );
                } else
                {
                    alert( "Sent to Discord ✅" );
                    pop.remove();
                }
            }
        );
    };
}
