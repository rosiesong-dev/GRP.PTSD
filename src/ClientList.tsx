import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

interface Client {
  id: number
  name: string | null
}

function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [name, setName] = useState('')

  // 수정용 상태
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  // READ
  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .order('id', { ascending: false })

    if (data) setClients(data)
  }

  // CREATE
  const addClient = async () => {
    if (!name) return

    await supabase.from('clients').insert([{ name }])
    setName('')
    fetchClients()
  }

  // UPDATE
  const startEdit = (client: Client) => {
    setEditId(client.id)
    setEditName(client.name ?? '')
  }

  const updateClient = async () => {
    if (!editId) return

    await supabase
      .from('clients')
      .update({ name: editName })
      .eq('id', editId)

    setEditId(null)
    setEditName('')
    fetchClients()
  }

  // DELETE
  const deleteClient = async (id: number) => {
    await supabase.from('clients').delete().eq('id', id)
    fetchClients()
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Clients CRUD Demo</h2>

      {/* CREATE */}
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 입력"
        />
        <button onClick={addClient}>추가</button>
      </div>

      <hr />

      {/* UPDATE */}
      {editId && (
        <div>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <button onClick={updateClient}>저장</button>
          <button onClick={() => setEditId(null)}>취소</button>
        </div>
      )}

      <ul>
        {clients.map((client) => (
          <li key={client.id}>
            {client.name}
            <button onClick={() => startEdit(client)}>수정</button>
            <button onClick={() => deleteClient(client.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ClientList