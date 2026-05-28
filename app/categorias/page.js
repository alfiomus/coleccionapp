'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState('')
  const [parentId, setParentId] = useState(null)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarCategorias()
  }, [])

  async function cargarCategorias() {
    setLoading(true)
    const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre')

    if (error) {
        console.error('Código:', error.code)
        console.error('Mensaje:', error.message)
        console.error('Detalles:', error.details)
    } else {
      setCategorias(data)
    }
    setLoading(false)
  }

  async function buscarSimilares(nombre) {
    const { data } = await supabase
      .from('categorias')
      .select('nombre')
      .ilike('nombre', `%${nombre}%`)

    return data || []
  }

  async function proponerCategoria(e) {
    e.preventDefault()
    if (!nueva.trim()) return

    // Buscar similares antes de crear
    const similares = await buscarSimilares(nueva)
    if (similares.length > 0) {
      setMensaje(`⚠️ Ya existe una categoría similar: "${similares[0].nombre}". ¿Querés agregar una subcategoría de esa?`)
      return
    }

    const { error } = await supabase
      .from('categorias')
      .insert({
        nombre: nueva.trim(),
        parent_id: parentId,
        aprobada: false
      })

    if (error) {
      setMensaje('❌ Hubo un error al proponer la categoría.')
    } else {
      setMensaje('✅ ¡Propuesta enviada! Un moderador la va a revisar pronto.')
      setNueva('')
      setParentId(null)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
        Categorías
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Explorá las categorías de coleccionismo o proponé una nueva.
      </p>

      {loading ? (
        <p>Cargando categorías...</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '2rem' }}>
          {categorias.map(cat => (
            <div
              key={cat.id}
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                background: '#E1F5EE',
                color: '#085041',
                fontWeight: '500',
                fontSize: '14px',
                border: '1.5px solid #8DDBBF'
              }}
            >
              {cat.nombre}
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: '#F5F5F2',
        borderRadius: '14px',
        padding: '1.5rem',
        border: '1px solid #E2E2DE'
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
          Proponer categoría nueva
        </h2>

        <form onSubmit={proponerCategoria}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
              NOMBRE DE LA CATEGORÍA
            </label>
            <input
              type="text"
              value={nueva}
              onChange={e => { setNueva(e.target.value); setMensaje('') }}
              placeholder="Ej: Miniaturas militares"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #E2E2DE',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
              ¿ES SUBCATEGORÍA DE? (opcional)
            </label>
            <select
              value={parentId || ''}
              onChange={e => setParentId(e.target.value || null)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #E2E2DE',
                fontSize: '14px',
                background: '#fff',
                outline: 'none'
              }}
            >
              <option value="">Ninguna — es una categoría principal</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          {mensaje && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: mensaje.startsWith('✅') ? '#E1F5EE' : '#FAEEDA',
              color: mensaje.startsWith('✅') ? '#085041' : '#5C3006',
              fontSize: '13px',
              marginBottom: '1rem'
            }}>
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#185FA5',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Proponer categoría
          </button>
        </form>
      </div>
    </div>
  )
}