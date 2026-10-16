# Abstraxn brand film, 58 s: production notes

**Deliverables:** `styleframes/` (12 × 1920×1080 PNG, one per scene), `Abstraxn_BrandFilm_61s_v3.mp4` (61.0 s, 30 fps, music placeholder), this file.
**Code:** `studio/src/film58/` (composition `Brand58`), music `pipeline/make_brand58_score.py`.

## What changed from the brief, and why

1. **Scene boundaries snapped to the beat.** At 118 BPM one beat is 15.25 frames, so the brief's round-second timestamps never land on a beat. Each scene starts on the nearest beat instead, so every cut is a downbeat cut. Drift is never more than 0.2 s:

   | Scene | Brief | Film | Beat |
   |---|---|---|---|
   | S1 | 0:00 | 0:00.00 | 0 |
   | S2 | 0:04 | 0:04.07 | 8 |
   | S3 | 0:08 | 0:08.14 | 16 |
   | S4 | 0:11 | 0:11.19 | 22 |
   | S5 | 0:18 | 0:17.80 | 35 |
   | S6 | 0:22 | 0:21.86 | 43 |
   | S7 | 0:26 | 0:25.93 | 51 |
   | S8 | 0:31 | 0:31.02 | 61 |
   | S9 | 0:35 | 0:35.08 | 69 |
   | S10 | 0:39 | 0:39.15 | 77 |
   | S11 | 0:46 | 0:45.76 | 90 |
   | S12 | 0:52 | 0:51.86 | 102 |

2. **The full stop is the HELD stamp.** The music cuts dead on beat 77 (0:39.15), the frame the coral row stamps, and stays silent until the receipt's verify tick on beat 86 (0:43.73), where it returns with an impact. That's 4.6 s of silence carrying the emotional peak, with only the stamp, print and tick sounds.

3. **Long lines split across two lines on cards; wording unchanged.** Where the brief joins parts with "·", the first part becomes a heading:
   - S6 badge: "Verified agent" / "acting for Studio Ivy"
   - S9 card: "Needs your yes" / "Papercraft Pro · $49/month · recurring"
   - S10 card: "■ PAYMENT HELD" / "Northline Supply · $96.20" / "Bank details changed 14 hours ago. Your rule: hold until you check."
   - S10 receipt: key/value rows (decision held, rule payee_changed, passed amount, merchant, receipt 0x2b91…4e08) instead of one "·" line, so it reads as a receipt
   - S12 button "Build your agent" is a pill with abstraxn.com beside it

4. **S2 coin gag** swaps the "a" in "pay" for a green coin (a "$" in JetBrains Mono inside a green ring) for exactly 6 frames.

5. **S3** words land on half-beats and then the frame is held completely still for about 1.6 s. The scene is 6 beats long because of the beat grid, so the hold is a little longer than the brief's 1 s.

6. **S6 merchant total:** the line items sum exactly to $102.40 (Sketch paper A3 × 4 $58.40, Ink set $28.00, Masking tape $16.00), so the checkout holds up to a frame-by-frame look.

7. **S7 re-sort order** after the freight query: Freight quotes, Market data, FX rates, Weather, Web search, Translation (by relevance to the query).

8. **The dot grid is a 48 × 27 canvas** (one dot per 40 px), drawn every frame. It reveals radially in S1, explodes in S2 with flickering waves that speed up with the music, snaps grey in S3, fills green row by row in S8 (one eighth per beat, so the S2 chaos is put in order), flashes coral around the held row in S10, and settles in S12.

9. **End-screen hold:** every element in S12 is settled by about 0:54.8. The last 3.2 s are completely static, with clean space for YouTube end-screen elements.

10. **Logo** is drawn from the official `logo-dark.svg` paths with no glow, shadow or recolouring. It only fades and scales in after the particle burst.

11. **Music** is a code-generated placeholder (minimal electronic, 118 BPM, A minor): intro pulse, then a build, an explosion, near silence, the groove, the full stop, the return and a resolve. Swap in the final track once its stop and return land on beats 77 and 86.

12. **No em or en dashes** anywhere in the on-screen copy (checked with a grep of the scene code).

## Revision 2 (user feedback, 2026-10-16)

- **Dots → logo triangles.** Every grid point is now the small triangle from the Abstraxn mark (the 550.871,419.915 / 275.44,265.932 / 433.996,0 piece of `logo-light.svg`), same orientation as the logo.
- **More reading time where several things move at once**, without changing the 58 s length or the beat grid:
  - S4: sentence types faster (96 chars/s), so the four rule cards fly out one per beat instead of every half-beat, with a slightly longer flight.
  - S7: tiles cascade at 6-frame steps, the re-sort eases over 22 frames instead of 12, the freight highlight and receipt chip follow a little later.
  - S11: each layer name lands instantly and holds full screen for 10 frames (14 for Know Your Intent) before snapping into its block.
- Everything else unchanged.

## Revision 3 (user feedback, 2026-10-16)

- **Length 58 s → 61 s** (user allowed a few extra seconds for readability). S4, S7 and S11 each get 2 extra beats; all other scenes keep their exact timing. New scene starts (beats): S5 37, S6 45, S7 53, S8 65, S9 73, S10 81, S11 94, S12 108, end 120.
- Rule cards in S4 now fly every 1.25 beats; S7 re-sort starts half a beat later with the "Pays per call. In cents." line after it; S11 base row lands on beats 0 to 3, the top row on 4.5 to 7.5, Know Your Intent on beat 9, each name held about a beat at full size.
- Music map moved with the scenes: **full stop now 0:41.19** (HELD stamp) and **return at 0:45.76** (verify tick). End-screen hold is still 3 s.
- **Playback fix:** the file is now tagged bt709 throughout and has its index at the front (`+faststart`), so QuickTime and browsers open it instantly. Delivered under a new file name so an already-open player window cannot hold the old file.

## Not done yet (as briefed: "later")

- 1080×1920 and 1080×1080 cutdowns. The scenes use absolute 1920×1080 layouts, so each cutdown needs its own layout pass, mainly for the type sizes and the S4, S6 and S10 two-column scenes.
