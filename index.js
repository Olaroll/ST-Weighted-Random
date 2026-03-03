/**
 * Weighted Random Macros Extension for SillyTavern
 * 
 * Provides {{wrandom}} and {{wpick}} macros that support weighted selection
 * instead of uniform random selection.
 * 
 * Syntax:
 * {{wrandom::60:common::30:uncommon::10:rare}}
 * {{wpick::3:apple::0.1:banana::0:no pear}}
 */

import { seedrandom } from '../../../lib.js';
import { chat_metadata, getCurrentChatId } from '../../../script.js';
import { getStringHash } from '../../utils.js';

(function() {
    'use strict';

    const MODULE_NAME = 'weighted-random';

    /**
     * Parses weighted list arguments and returns items with their weights.
     * Format: weight1:item1::weight2:item2::weight3:item3
     * 
     * @param {string[]} args - Array of arguments from the macro
     * @returns {{ items: string[], weights: number[], totalWeight: number, error: string|null }}
     */
    function parseWeightedList(args) {
        const items = [];
        const weights = [];
        let error = null;

        for (const arg of args) {
            // Split on first colon only
            const colonIndex = arg.indexOf(':');
            if (colonIndex === -1) {
                error = 'Invalid format: each item must have format "weight:value"';
                break;
            }

            const weightStr = arg.substring(0, colonIndex).trim();
            const item = arg.substring(colonIndex + 1); // Don't trim - preserve leading space after colon, but we'll trim it

            // Parse weight
            const weight = parseFloat(weightStr);
            if (isNaN(weight)) {
                error = `Can't parse weight: "${weightStr}"`;
                break;
            }

            if (weight < 0) {
                error = `Negative weight: ${weight}`;
                break;
            }

            // Trim whitespace after the colon from the item
            items.push(item.trimStart());
            weights.push(weight);
        }

        // Check if all weights are zero
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        if (totalWeight === 0 && weights.length > 0) {
            error = 'All weights are 0';
        }

        return { items, weights, totalWeight, error };
    }

    /**
     * Selects a random item based on weights.
     * 
     * @param {string[]} items - Array of items to choose from
     * @param {number[]} weights - Array of weights corresponding to items
     * @param {number} totalWeight - Sum of all weights
     * @param {Function} rng - Random number generator function (returns 0-1)
     * @returns {string} The selected item
     */
    function weightedSelect(items, weights, totalWeight, rng) {
        if (items.length === 0) return '';
        if (totalWeight === 0) return '';

        const random = rng() * totalWeight;
        let cumulative = 0;

        for (let i = 0; i < items.length; i++) {
            cumulative += weights[i];
            if (random < cumulative) {
                return items[i];
            }
        }

        // Fallback (shouldn't happen due to floating point precision)
        return items[items.length - 1];
    }

    /**
     * Gets a hashed id of the current chat from the metadata.
     * @returns {number} The hashed chat id
     */
    function getChatIdHash() {
        const cachedIdHash = chat_metadata.chat_id_hash;
        if (typeof cachedIdHash === 'number') {
            return cachedIdHash;
        }

        const chatId = chat_metadata.main_chat ?? getCurrentChatId();
        const chatIdHash = getStringHash(chatId);
        chat_metadata.chat_id_hash = chatIdHash;
        return chatIdHash;
    }

    /**
     * Registers the weighted random macros with SillyTavern.
     */
    function registerWeightedMacros() {
        const context = SillyTavern.getContext();
        const { macros } = context;

        // Register {{wrandom}} - weighted random selection (re-rolled each time)
        macros.register('wrandom', {
            category: macros.category.RANDOM,
            list: true,
            description: 'Picks a random item from a weighted list. Will be re-rolled every time macros are resolved. Format: weight:item (e.g., {{wrandom::60:common::30:uncommon::10:rare}})',
            returns: 'Randomly selected item based on weights.',
            exampleUsage: [
                '{{wrandom::60:common::30:uncommon::10:rare}}',
                '{{wrandom::3:apple::1:banana::0.5:cherry}}',
            ],
            handler: ({ list, warn }) => {
                if (!list || list.length === 0) {
                    warn('No items provided');
                    return '';
                }

                const { items, weights, totalWeight, error } = parseWeightedList(list);

                if (error) {
                    warn(error);
                    return '';
                }

                if (items.length === 0) {
                    return '';
                }

                const rng = seedrandom('added entropy.', { entropy: true });
                return weightedSelect(items, weights, totalWeight, rng);
            },
        });

        // Register {{wpick}} - weighted pick (deterministic based on chat and position)
        macros.register('wpick', {
            category: macros.category.RANDOM,
            list: true,
            description: 'Picks a random item from a weighted list, but keeps the choice stable for a given chat and macro position. Format: weight:item (e.g., {{wpick::3:apple::0.1:banana::0:no pear}}). Can be rerolled via /reroll-pick slash command.',
            returns: 'Stable randomly selected item based on weights.',
            exampleUsage: [
                '{{wpick::60:common::30:uncommon::10:rare}}',
                '{{wpick::3:apple::0.1:banana::0:no pear}}',
            ],
            handler: ({ list, warn, globalOffset, env }) => {
                if (!list || list.length === 0) {
                    warn('No items provided');
                    return '';
                }

                const { items, weights, totalWeight, error } = parseWeightedList(list);

                if (error) {
                    warn(error);
                    return '';
                }

                if (items.length === 0) {
                    return '';
                }

                // Use the same deterministic seeding logic as {{pick}}
                const chatIdHash = getChatIdHash();
                const rawContentHash = env.contentHash;
                const offset = globalOffset;
                const rerollSeed = chat_metadata.pick_reroll_seed || null;

                const combinedSeedString = [chatIdHash, rawContentHash, offset, rerollSeed]
                    .filter(it => it !== null)
                    .join('-');
                const finalSeed = getStringHash(combinedSeedString);
                const rng = seedrandom(String(finalSeed));

                return weightedSelect(items, weights, totalWeight, rng);
            },
        });

        console.log(`[${MODULE_NAME}] Weighted random macros registered successfully`);
    }

    // Initialize the extension
    registerWeightedMacros();
})();
