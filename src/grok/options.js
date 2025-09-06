document.getElementById( 'save' ).onclick = () =>
{
    const webhookUrl = document.getElementById( 'webhookUrl' ).value || 'https://discord.com/api/webhooks/1413746841077551104/wxCPSJ4eIk7CTYrKjb3LK-1Da269X34l4Sbyb0Em8djLQ2X6oXobVju6GbtfkNlPo67Y';
    let keywords;
    try
    {
        keywords = JSON.parse( document.getElementById( 'keywords' ).value || '["dogs", "cats", "inspo", "design"]' );
        if ( !Array.isArray( keywords ) ) throw new Error( 'Keywords must be an array' );
    } catch ( e )
    {
        return alert( 'Invalid JSON for keywords! Use format: ["keyword1", "keyword2"]' );
    }
    chrome.storage.sync.set( { webhookUrl, keywords }, () =>
    {
        alert( 'Saved!' );
    } );
};

// Load existing
chrome.storage.sync.get( [ 'webhookUrl', 'keywords' ], ( data ) =>
{
    document.getElementById( 'webhookUrl' ).value = data.webhookUrl || 'https://discord.com/api/webhooks/1413746841077551104/wxCPSJ4eIk7CTYrKjb3LK-1Da269X34l4Sbyb0Em8djLQ2X6oXobVju6GbtfkNlPo67Y';
    document.getElementById( 'keywords' ).value = JSON.stringify( data.keywords || [ 'dogs', 'cats', 'inspo', 'design' ] );
} );