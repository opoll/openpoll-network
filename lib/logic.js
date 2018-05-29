
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Transaction to respond to a poll
 * @param {org.openpoll.network.RespondToPoll} tx
 * @transaction
 */
async function respondToPoll(tx) {
    // Fetch the poll asset using a rich query
    let pollQueryResults = await query('selectPollByPollHash', {
        pollHash: tx.response.pollHash
    });

    // Extract the poll asset from the query
    let poll;
    if(pollQueryResults[0]){
        poll = pollQueryResults[0]
    } else {
        // Throw error. Poll with response.pollHash not found.
    }

    // Add the response to the poll
    poll.responses.push(tx.response);

    // Get the asset registry for Poll assets and Response asssets
    const responseAssetRegistry = await getAssetRegistry('org.openpoll.network.Response');
    const pollAssetRegistry = await getAssetRegistry('org.openpoll.network.Poll');

    // Save the response to the response asset registry
    await responseAssetRegistry.add(tx.response);

    // Update the poll asset in the poll asset registry.
    await pollAssetRegistry.update(poll);

    /**
     * Transactions are atomic. If all goes well and the response is confirmed and added
     * to the blockchain the 'ResponseConfirmed' event will be emitted for listening client
     * applications to consume
    */
    let responseConfirmed = getFactory().newEvent('org.openpoll.network', 'ResponseConfirmed');
    responseConfirmed.response = tx.response;
    emit(responseConfirmed);
}
