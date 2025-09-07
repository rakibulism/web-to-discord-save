// popup.js
const channelSelect = document.getElementById( 'channelSelect' );
const manageBtn = document.getElementById( 'manageChannels' );
const channelsList = document.getElementById( 'channelsList' );
const channelsManager = document.getElementById( 'channelsManager' );
const addChannelBtn = document.getElementById( 'addChannel' );
const closeManagerBtn = document.getElementById( 'closeManager' );
const newName = document.getElementById( 'newName' );
const newWebhook = document.getElementById( 'newWebhook' );
const sendBtn = document.getElementById( 'sendBtn' );
const sendWithMediaBtn = document.getElementById( 'sendWithMediaBtn' );
const messageText = document.getElementById( 'messageText' );
const statusEl = document.getElementById( 'status' );
const pageTitleEl = document.getElementById( 'pageTitle' );
const pageUrlEl = document.getElementById( 'pageUrl' );

async function getCurrentTabInfo ()
{
    const [ tab ] = await chrome.tabs.query( { active: true, currentWindow: true } );
    return tab;
}

async function loadPageInfo ()
{
    const tab = await getCurrentTabInfo();
    pageTitleEl.textContent = tab?.title || '';
    pageUrlEl.textContent = tab?.url || '';
}

function setStatus ( msg, timeout = 3000 )
{
    statusEl.textContent = msg;
    if ( timeout ) setTimeout( () => statusEl.textContent = '', timeout );
}

async function loadChannels ()
{
    const data = await chrome.storage.local.get( { channels: [], defaultChannel: null } );
    const channels = data.channels || [];
    // populate select
    channelSelect.innerHTML = '';
    channels.forEach( ( c, idx ) =>
    {
        const opt = document.createElement( 'option' );
        opt.value = c.id;
        opt.textContent = `${ c.name }`;
        channelSelect.appendChild( opt );
    } );
    if ( channels.length === 0 )
    {
        const opt = document.createElement( 'option' );
        opt.textContent = 'no channels — add one';
        opt.disabled = true;
        channelSelect.appendChild( opt );
    } else
    {
        if ( data.defaultChannel )
        {
            channelSelect.value = data.defaultChannel;
        }
    }

    // populate manager list
    channelsList.innerHTML = '';
    channels.forEach( c =>
    {
        const row = document.createElement( 'div' );
        row.className = 'channelRow';
        row.innerHTML = `<div>
      <strong>${ c.name }</strong><br/><small>${ c.webhook }</small>
    </div>`;
        const btns = document.createElement( 'div' );
        btns.className = 'channelBtns';
        const setDef = document.createElement( 'button' );
        setDef.textContent = 'Default';
        setDef.onclick = async () =>
        {
            await chrome.storage.local.set( { defaultChannel: c.id } );
            setStatus( 'Default set' );
            loadChannels();
        };
        const remove = document.createElement( 'button' );
        remove.textContent = 'Remove';
        remove.onclick = async () =>
        {
            const data = await chrome.storage.local.get( { channels: [] } );
            const remaining = ( data.channels || [] ).filter( x => x.id !== c.id );
            await chrome.storage.local.set( { channels: remaining } );
            loadChannels();
        };
        btns.appendChild( setDef );
        btns.appendChild( remove );
        row.appendChild( btns );
        channelsList.appendChild( row );
    } );
}

manageBtn.addEventListener( 'click', () =>
{
    channelsManager.classList.toggle( 'hidden' );
} );

addChannelBtn.addEventListener( 'click', async () =>
{
    const name = newName.value.trim();
    const webhook = newWebhook.value.trim();
    if ( !name || !webhook )
    {
        setStatus( 'Provide both name and webhook URL' );
        return;
    }
    const id = 'ch_' + Math.random().toString( 36 ).slice( 2, 9 );
    const d = await chrome.storage.local.get( { channels: [] } );
    const channels = d.channels || [];
    channels.push( { id, name, webhook } );
    await chrome.storage.local.set( { channels } );
    newName.value = '';
    newWebhook.value = '';
    setStatus( 'Channel added' );
    loadChannels();
} );

closeManagerBtn.addEventListener( 'click', () =>
{
    channelsManager.classList.add( 'hidden' );
} );

sendBtn.addEventListener( 'click', async () =>
{
    const tab = await getCurrentTabInfo();
    const selectedId = channelSelect.value;
    const { channels } = await chrome.storage.local.get( { channels: [] } );
    const ch = ( channels || [] ).find( x => x.id === selectedId );
    if ( !ch ) { setStatus( 'Select a channel' ); return; }
    const payload = {
        type: 'send',
        webhook: ch.webhook,
        content: messageText.value || '',
        page: { title: tab.title, url: tab.url },
        media: null
    };
    chrome.runtime.sendMessage( payload, ( resp ) =>
    {
        setStatus( resp?.message || 'sent' );
    } );
} );

sendWithMediaBtn.addEventListener( 'click', async () =>
{
    // This attempts to ask the active tab for any 'lastClickedMedia' saved by the content script.
    const tab = await getCurrentTabInfo();
    const selectedId = channelSelect.value;
    const { channels } = await chrome.storage.local.get( { channels: [] } );
    const ch = ( channels || [] ).find( x => x.id === selectedId );
    if ( !ch ) { setStatus( 'Select a channel' ); return; }

    // ask content script for last clicked media (if any)
    chrome.tabs.sendMessage( tab.id, { type: 'getLastClickedMedia' }, ( resp ) =>
    {
        const media = resp?.media || null;
        const payload = {
            type: 'send',
            webhook: ch.webhook,
            content: messageText.value || '',
            page: { title: tab.title, url: tab.url },
            media
        };
        chrome.runtime.sendMessage( payload, ( r ) => setStatus( r?.message || 'sent' ) );
    } );
} );

async function init ()
{
    await loadPageInfo();
    await loadChannels();
}

init();
