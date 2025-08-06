import React, { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [pokemons, setPokemons] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPokemon, setSelectedPokemon] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
      const data = await res.json()
      const details = await Promise.all(
        data.results.map(async (p) => {
          const res = await fetch(p.url)
          return await res.json()
        })
      )
      setPokemons(details)
    }
    fetchData()
  }, [])

  const filtered = pokemons.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="app">
      <h1>Pokédex</h1>
      <input
        type="text"
        placeholder="Rechercher un Pokémon..."
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <div className="pokemon-list">
        {filtered.map((pokemon) => (
          <div
            key={pokemon.id}
            className={`pokemon-card type-${pokemon.types[0].type.name}`}
            onClick={() => setSelectedPokemon(pokemon)}
          >
            <div className="pokemon-type">{pokemon.types[0].type.name}</div>
            <img src={pokemon.sprites.front_default} alt={`Image de ${pokemon.name}`} />
            <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
          </div>
        ))}
      </div>

      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  )
}

function PokemonModal({ pokemon, onClose }) {
  const [species, setSpecies] = useState(null)
  const [evolutionNames, setEvolutionNames] = useState([])
  const [weaknesses, setWeaknesses] = useState([])

  useEffect(() => {
    const fetchExtra = async () => {
      const resSpecies = await fetch(pokemon.species.url)
      const speciesData = await resSpecies.json()
      setSpecies(speciesData)

      const evoRes = await fetch(speciesData.evolution_chain.url)
      const evoData = await evoRes.json()

      const names = []
      let evo = evoData.chain
      while (evo) {
        names.push(evo.species.name)
        evo = evo.evolves_to[0]
      }
      setEvolutionNames(names)

      const typeUrls = pokemon.types.map(t => t.type.url)
      const weaknessesSet = new Set()
      for (const url of typeUrls) {
        const res = await fetch(url)
        const data = await res.json()
        data.damage_relations.double_damage_from.forEach(t => weaknessesSet.add(t.name))
      }
      setWeaknesses([...weaknessesSet])
    }
    fetchExtra()
  }, [pokemon])

  if (!species) return null

  const types = pokemon.types.map(t => t.type.name).join(', ')
  const abilities = pokemon.abilities.map(a => a.ability.name).join(', ')
  const genderRate = species.gender_rate
  const category = species.genera.find(g => g.language.name === "fr")?.genus || "Espèce"

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}>✖</button>
        <h2>{pokemon.name.toUpperCase()} (#{pokemon.id})</h2>
        <img src={pokemon.sprites.front_default} alt={pokemon.name} />

        <p><strong>Catégorie :</strong> {category}</p>
        <p><strong>Taille :</strong> {pokemon.height}</p>
        <p><strong>Poids :</strong> {pokemon.weight}</p>
        <p><strong>Types :</strong> {types}</p>
        <p><strong>Talents :</strong> {abilities}</p>
        <p><strong>Faiblesses :</strong> {weaknesses.join(', ')}</p>
        <p><strong>Évolutions :</strong> {evolutionNames.join(' ➜ ')}</p>
      </div>
    </div>
  )
}

export default App
