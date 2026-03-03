# Usage Examples

This file contains practical examples of how to use the weighted random macros in your SillyTavern prompts.

## Character Creation Examples

### Hair Color with Realistic Distribution
```
Hair: {{wpick::45:brown::30:black::15:blonde::8:red::2:other}}
```

### Eye Color
```
Eyes: {{wpick::55:brown::20:blue::15:green::8:hazel::2:gray}}
```

### Personality Traits (Multiple Selections)
```
Personality: {{wrandom::30:friendly::25:reserved::20:outgoing::15:shy::10:mysterious}}
Mood: {{wrandom::40:cheerful::30:neutral::20:serious::10:melancholic}}
```

## Story Generation Examples

### Weather System
```
The weather today is {{wrandom::50:sunny::25:cloudy::15:rainy::8:foggy::2:stormy}}.
```

### Encounter Rarity
```
You encounter {{wrandom::60:a common traveler::30:a merchant::9:a knight::0.9:a wizard::0.1:a dragon}}.
```

### Loot Drops
```
You found {{wrandom::70:10 gold::20:50 gold::8:100 gold::1.9:a magic item::0.1:a legendary artifact}}!
```

## Conditional Examples

### Time-Based (using with other macros)
```
{{if {{time}}}}
Current activity: {{wrandom::40:working::30:relaxing::20:eating::10:sleeping}}
{{/if}}
```

### Excluding Options with Zero Weight
```
Available drinks: {{wrandom::40:water::30:tea::20:coffee::10:juice::0:alcohol (character is underage)}}
```

## Stable Character Details (using wpick)

These will remain consistent throughout the chat:

```
Character Background:
- Hometown: {{wpick::40:a small village::30:a large city::20:a coastal town::10:the mountains}}
- Occupation: {{wpick::35:merchant::25:guard::20:farmer::15:scholar::5:noble}}
- Secret: {{wpick::50:has a hidden talent::30:knows a secret::15:is searching for someone::5:is not who they claim to be}}
```

## Advanced: Nested Macros

### Dynamic Descriptions
```
The {{wrandom::60:old::30:ancient::10:mysterious}} {{wrandom::50:book::30:scroll::20:tome}} contains {{wrandom::40:common::35:uncommon::20:rare::5:legendary}} knowledge.
```

### Character Reactions
```
{{char}} {{wrandom::45:smiles::25:nods::15:laughs::10:frowns::5:gasps}} and says, "{{wrandom::40:That's interesting!::30:I see.::20:Really?::10:Fascinating!}}"
```

## Practical Tips

1. **Use wpick for character attributes** that should remain consistent (appearance, background, etc.)
2. **Use wrandom for dynamic events** that should vary each time (weather, encounters, reactions)
3. **Weights don't need to sum to 100** - they're proportional (3:1:1 is the same as 60:20:20)
4. **Use decimal weights** for fine-tuning probabilities (0.1 for very rare events)
5. **Set weight to 0** to temporarily disable an option without removing it

## Testing Your Weights

To verify your weight distribution, you can use this formula:
```
Probability = (item_weight) / (sum_of_all_weights)
```

Example: `{{wrandom::3:A::1:B::1:C}}`
- Total weight: 3 + 1 + 1 = 5
- A: 3/5 = 60%
- B: 1/5 = 20%
- C: 1/5 = 20%
