var maxDifferenceInSecondsForCacheToBeStale = 10
var cache = null
var cached_at = null

function setCacheTo(value) {
    let stringified = JSON.stringify(value)
    console.log("Setting cache to..:" + stringified.substring(0, 20))
    cache = stringified
}

async function updateCache(asyncCallback) {
    console.log("Updating cache called..")
    cached_at = new Date()

    setCacheTo(await asyncCallback())
}

async function checkCache(asyncCallback) {
    if (cache == null) {
        await updateCache(asyncCallback)
        return;
    }
    var now = new Date()
    var diffInSeconds = (now - cached_at) / 1000
    if (diffInSeconds > maxDifferenceInSecondsForCacheToBeStale) {
        // don't await
        updateCache(asyncCallback)
    }
}

async function getLatest(asyncCallback) {
    try {
        await checkCache(asyncCallback)
    } catch {

    }
    return cache
}

export default getLatest