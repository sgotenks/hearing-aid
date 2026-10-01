# cards

Custom **cards** block. 

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: repeating cards; each card: optional image or icon cell + body cell (heading, short text, CTA). icon-badge cards add a small icon picture in the body; steps cards are auto-numbered.

## Supported variations

| Variation | Option class |
| --- | --- |
| Icon | `icon` |
| Teaser | `teaser` |
| Steps | `steps` |
| Image Overlay | `image-overlay` |
| Promo Tile | `promo-tile` |
| Icon Badge | `icon-badge` |

## Universal Editor fields

- Content fields derived from the block's decorate contract.
- `classes` select for options: Icon, Teaser, Steps, Image Overlay, Promo Tile, Icon Badge.
