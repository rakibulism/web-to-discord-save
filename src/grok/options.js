document.getElementById( 'save' ).onclick = () =>
{
    const webhookUrl = document.getElementById( 'webhookUrl' ).value;
    let keywords;
    try
    {
        keywords = JSON.parse( document.getElementById( 'keywords' ).value );
    } catch ( e )
    {
        return alert( 'Invalid JSON for keywords!' );
    }
    chrome.storage.sync.set( { webhookUrl, keywords }, () =>
    {
        alert( 'Saved!' );
    } );
};

// Load existing
chrome.storage.sync.get( [ 'webhookUrl', 'keywords' ], ( data ) =>
{
    document.getElementById( 'webhookUrl' ).value = data.webhookUrl || '';
    document.getElementById( 'keywords' ).value = JSON.stringify( data.keywords || [] );
} );