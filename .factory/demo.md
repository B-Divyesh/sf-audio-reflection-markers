# Demo sandbox

Open `/?demo=1`, `/demo`, or `/demo/` to load two sample markers from a realistic lecture. On a phone, the first complete marker and cue appear above the source form. The persistent banner identifies sample mode and offers **Reset demo** and **Start for real**.

Demo markers use the IndexedDB database `demo:reflection-markers` and source storage key `demo:arm-source`. Real markers use `reflection-markers` and `arm-source`. The two modes never read or write each other’s storage. **Reset demo** restores the two fixtures. **Start for real** clears the demo namespace before opening the real workspace.
