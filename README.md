# Weighted Random Macros for SillyTavern

A SillyTavern extension that provides weighted alternatives to the built-in `{{random}}` and `{{pick}}` macros.

## Features

- **`{{wrandom}}`** - Weighted random selection (re-rolled each time)
- **`{{wpick}}`** - Weighted pick (deterministic, stable per chat and position)

## Installation

1. Download or clone this repository
2. Place the `ST-Weighted-Random` folder in your SillyTavern extensions directory:
   - For all users: `SillyTavern/public/scripts/extensions/third-party/`
   - For current user: `SillyTavern/data/<user-handle>/extensions/`
3. Restart SillyTavern or reload extensions
4. The macros will be automatically available

## Usage

### Syntax

Both macros use the same syntax format:

```
{{wrandom::weight1:item1::weight2:item2::weight3:item3}}
{{wpick::weight1:item1::weight2:item2::weight3:item3}}
```

**Important:** Whitespace after the colon is automatically trimmed, so these are equivalent:
- `{{wrandom::60:common::30:uncommon::10:rare}}`
- `{{wrandom::60: common::30: uncommon::10: rare}}`

### Examples

#### Basic weighted selection
```
{{wrandom::60:common::30:uncommon::10:rare}}
```
This will select:
- "common" 60% of the time
- "uncommon" 30% of the time
- "rare" 10% of the time

#### Decimal weights
```
{{wrandom::3:apple::1:banana::0.5:cherry}}
```
Weights don't need to add up to 100 - they're proportional:
- "apple" has 3/(3+1+0.5) = 66.7% chance
- "banana" has 1/(3+1+0.5) = 22.2% chance
- "cherry" has 0.5/(3+1+0.5) = 11.1% chance

#### Zero weights (exclusion)
```
{{wpick::3:apple::0.1:banana::0:no pear}}
```
Items with weight 0 will never be selected (useful for conditional exclusions).

#### Stable picks with {{wpick}}
```
The character's hair color is {{wpick::60:blonde::30:brown::10:red}}.
```
Unlike `{{wrandom}}`, `{{wpick}}` will return the same result for the same position in the same chat, even across reloads. Use `/reroll-pick` slash command to reset all picks in the current chat.

## Differences from Built-in Macros

| Feature | `{{random}}` | `{{wrandom}}` | `{{pick}}` | `{{wpick}}` |
|---------|-------------|--------------|-----------|------------|
| Selection | Uniform | Weighted | Uniform | Weighted |
| Stability | Re-rolled | Re-rolled | Stable | Stable |
| Syntax | `::item1::item2` | `::weight:item1::weight:item2` | `::item1::item2` | `::weight:item1::weight:item2` |

## Error Handling

The extension handles errors gracefully, matching SillyTavern's built-in macro behavior:

- **Can't parse weight**: Returns empty string and logs warning
  ```
  {{wrandom::abc:invalid}}  → ""
  ```

- **Negative weight**: Returns empty string and logs warning
  ```
  {{wrandom::-5:negative}}  → ""
  ```

- **All weights 0**: Returns empty string and logs warning
  ```
  {{wrandom::0:none::0:zero}}  → ""
  ```

- **Invalid format**: Returns empty string and logs warning
  ```
  {{wrandom::nocolon}}  → ""
  ```

## Technical Details

- Uses the same seeding logic as built-in `{{pick}}` for deterministic behavior
- Integrates with SillyTavern's macro registry system
- Supports the `/reroll-pick` command for resetting `{{wpick}}` selections
- Follows SillyTavern extension best practices

## License

This extension is open source. Feel free to modify and distribute.

## Author

Olaroll

## Repository

https://github.com/Olaroll/ST-Weighted-Random
