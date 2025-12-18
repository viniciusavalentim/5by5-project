import { Toaster } from "sonner";
import { Home } from "./pages";
function App() {

  return (
    <>
      <Toaster position="top-center" richColors />
      <Home />
      {/* <div
          className="relative overflow-hidden rounded-xl bg-linear-to-r from-[#0d0617] to-[#1a0d2e] border border-purple-900/20 shadow-xl group"
        >
          teste

        </div> */}
    </>
  )
}

export default App
