import { useState } from "react"
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useSessionWallet } from "@magicblock-labs/gum-react-sdk"
import { useProgram } from "../../utils/useProgram"

const SessionKeyButton = () => {
  const { publicKey } = useWallet()
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { program } = useProgram({ connection, wallet });
  const sessionWallet = useSessionWallet()
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateSession = async () => {
    setIsLoading(true)
    const topUp = true
    const expiryInMinutes = 600
    console.log(program)
    try {
      const session = await sessionWallet.createSession(
        program.programId,
        topUp,
        expiryInMinutes
      )
      console.log("Session created:", session)
    } catch (error) {
      console.error("Failed to create session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async () => {
    setIsLoading(true)
    try {
      await sessionWallet.revokeSession()
      console.log("Session revoked")
    } catch (error) {
      console.error("Failed to revoke session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {publicKey && (
        <button
          onClick={
            true
              ? handleCreateSession
              : handleRevokeSession
          }
        >
          {sessionWallet && sessionWallet.sessionToken == null
            ? "Create session"
            : "Revoke Session"}
        </button>
      )}
    </>
  )
}

export default SessionKeyButton
