# Demo sandbox

Open `/?demo=1` or `/demo` to load two sample markers from a realistic lecture. The persistent banner says that the data is a demo, offers **Reset demo**, and links to **Start for real**.

Demo markers use the IndexedDB database `demo:reflection-markers` and source storage key `demo:arm-source`. Real markers use `reflection-markers` and `arm-source`. The two modes never read or write each other’s storage.
