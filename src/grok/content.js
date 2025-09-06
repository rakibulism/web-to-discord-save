let saveButton = null;
let modal = null;

// Load config from storage
async function getConfig ()
{
    return new Promise( ( resolve ) =>
    {
        chrome.storage.sync.get( [ 'webhookUrl', 'keywords' ], ( data ) =>
        {
            resolve( data );
        } );
    } );
}

// Create save button
function createSaveButton ()
{
    const button = document.createElement( 'button' );
    button.textContent = 'Save';
    button.style.position = 'absolute';
    button.style.background = 'blue';
    button.style.color = 'white';
    button.style.padding = '5px';
    button.style.borderRadius = '5px';
    button.style.zIndex = 9999;
    button.style.cursor = 'pointer';
    return button;
}

// Parse post data (example for X/Twitter; extend for others)
function parsePost ( element )
{
    const post = element.closest( 'article' ) || element; // Adjust per site
    const url = window.location.href; // Or extract post-specific URL
    const authorElem = post.querySelector( '[data-testid="User-Name"] a' ); // X-specific
    const authorUrl = authorElem ? authorElem.href : '';
    const title = post.querySelector( '[data-testid="tweetText"]' )?.innerText || ''; // Desc as title
    const desc = title; // Reuse or extend
    const mediaUrls = Array.from( post.querySelectorAll( 'img, video' ) ).map( el => el.src || el.poster || '' );

    return { url, authorUrl, title, desc, mediaUrls };
}

// Send to Discord webhook
async function sendToDiscord ( data )
{
    const config = await getConfig();
    if ( !config.webhookUrl ) return alert( 'Set webhook in options!' );

    fetch( config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
            content: `Saved Post: ${ data.url } by ${ data.authorUrl } - Title: ${ data.title } - Desc: ${ data.desc } - Keywords: ${ data.keywords.join( ', ' ) } - Media: ${ data.mediaUrls.join( ', ' ) }`
        } )
    } ).catch( err => console.error( 'Send failed:', err ) );
}

// Quick save (Option 2)
async function quickSave ( element )
{
    const config = await getConfig();
    if ( !config.keywords ) return alert( 'Set keywords in options!' );

    const keywords = config.keywords;
    const selected = prompt( `Select up to 2 keywords (comma-separated): ${ keywords.join( ', ' ) }` ).split( ',' ).slice( 0, 2 ).map( k => k.trim() );

    const postData = parsePost( element );
    postData.keywords = selected;
    sendToDiscord( postData );
}

// Modal for Option 1
async function openModal ( element )
{
    if ( modal ) return;

    const config = await getConfig();
    if ( !config.keywords ) return alert( 'Set keywords in options!' );

    modal = document.createElement( 'div' );
    modal.className = 'save-modal';
    modal.innerHTML = `
    <div class="modal-content">
      <h2>Select Keywords (max 2)</h2>
      <div class="keywords"></div>
      <button id="saveBtn">Save</button>
      <button id="closeBtn">Close</button>
    </div>
  `;
    document.body.appendChild( modal );

    const keywordsDiv = modal.querySelector( '.keywords' );
    config.keywords.forEach( kw =>
    {
        const chip = document.createElement( 'span' );
        chip.textContent = kw;
        chip.className = 'chip';
        chip.onclick = () =>
        {
            chip.classList.toggle( 'selected' );
            const selected = Array.from( keywordsDiv.querySelectorAll( '.selected' ) );
            if ( selected.length > 2 ) chip.classList.remove( 'selected' );
        };
        keywordsDiv.appendChild( chip );
    } );

    modal.querySelector( '#saveBtn' ).onclick = () =>
    {
        const selected = Array.from( keywordsDiv.querySelectorAll( '.selected' ) ).map( c => c.textContent );
        const postData = parsePost( element || document.querySelector( 'article' ) ); // Fallback to first post
        postData.keywords = selected;
        sendToDiscord( postData );
        closeModal();
    };

    modal.querySelector( '#closeBtn' ).onclick = closeModal;
}

function closeModal ()
{
    if ( modal )
    {
        modal.remove();
        modal = null;
    }
}

// Hover listeners
document.addEventListener( 'mouseover', ( e ) =>
{
    const target = e.target.closest( 'article, img, video, .post' ); // Adjust selectors per site
    if ( target && !saveButton )
    {
        saveButton = createSaveButton();
        target.appendChild( saveButton );
        saveButton.style.top = '10px';
        saveButton.style.right = '10px';
        saveButton.onclick = () => quickSave( target );
    }
} );

document.addEventListener( 'mouseout', ( e ) =>
{
    if ( saveButton && !e.relatedTarget?.closest( '.save-button' ) )
    {
        saveButton.remove();
        saveButton = null;
    }
} );

// Listen for hotkey message
chrome.runtime.onMessage.addListener( ( msg ) =>
{
    if ( msg.action === 'openModal' )
    {
        openModal();
    }
} );