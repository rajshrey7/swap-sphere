import { Route, Routes } from "react-router-dom"
import { Home } from "./components/Home"
import { VidioCall } from "./components/VidioCall"
import { WhiteBoard } from "./components/WhiteBoard"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/call" element={<VidioCall />} />
        <Route path="/white-board" element={<WhiteBoard />} />
      </Routes>
    </>
  )
}

export default App
