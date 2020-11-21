import React from 'react'
import { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { useWindowSize } from '@react-hook/window-size/throttled'
import useMouse from '@rooks/use-mouse'
import random from 'lodash/random'
import {
  Stage,
  Container,
  AnimatedSprite,
  useApp,
  useTick,
} from '@inlet/react-pixi'

import './index.css'

const textureChain = (frames) => Object.keys(frames).map((k) => frames[k])
const getTextures = (textures, asTextureChain) =>
  asTextureChain ? textureChain(textures) : textures

// thanks AdrienLemaire 👇
function useTextures(spriteSheetPath, asTextureChain = false) {
  const [textures, setTextures] = useState()
  const app = useApp()

  useEffect(() => {
    // get from cache
    if (app.loader.resources[spriteSheetPath]) {
      setTextures(
        getTextures(app.loader.resources[spriteSheetPath], asTextureChain)
      )
      return
    }

    // else load
    app.loader.add(spriteSheetPath).load((_, resource) => {
      setTextures(
        getTextures(resource[spriteSheetPath].textures, asTextureChain)
      )
    })
  }, [app.loader, spriteSheetPath])

  return textures
}

// you can use it as React component
// saves you managing state, null check
const Textures = ({ children, spritesheet, textureChain = false }) => {
  const textures = useTextures(spritesheet, textureChain)
  if (!textures) return null
  return children(textures)
}

const JetFighter = (props) => {
  const [width, height] = useWindowSize()
  const [rot, setRot] = useState(0)
  useTick((delta) => delta && setRot((r) => r + 0.01 * delta))

  return (
    <Container rotation={rot} x={400} y={400}>
      <Textures
        spritesheet="https://pixijs.io/examples/examples/assets/spritesheet/fighter.json"
        textureChain={true}>
        {(textures) => (
          <AnimatedSprite
            animationSpeed={0.5}
            isPlaying={true}
            textures={textures}
            anchor={0.5}
          />
        )}
      </Textures>
      <Textures
        spritesheet="https://pixijs.io/examples/examples/assets/spritesheet/fighter.json"
        textureChain={true}>
        {(textures) => (
          <AnimatedSprite
            animationSpeed={0.5}
            isPlaying={true}
            textures={textures}
            anchor={0.5}
          />
        )}
      </Textures>
    </Container>
  )
}

const App = () => {
  const [width, height] = useWindowSize()
  const [bgSprite, setBgSprite] = useState(1)
  const [bgCache, setBgCache] = useState([])
  const [bgLoaded, setBgLoaded] = useState(false)
  const [bgRev, setBgRev] = useState(false)
  const titleText = ['FRANCHISE', 'TRAVIS', 'SCOTT']
  const jetFighters = [
    {
      x: random(0, window.innerWidth),
      y: random(0, window.innerHeight),
    },
    {
      x: random(0, window.innerWidth),
      y: random(0, window.innerHeight),
    },
    {
      x: random(0, window.innerWidth),
      y: random(0, window.innerHeight),
    },
  ]

  useEffect(() => {
    console.log('loading images...')
    for (let i = 0; i < 67; i++) {
      const bgCacheNow = bgCache
      bgCacheNow.push(
        <img
          className="background__img"
          src={`/bg/tscott_crowdloop0${i}.jpg`}
        />
      )
      setBgCache(bgCacheNow)
    }

    setTimeout(() => {
      console.log('images loaded.')
      setBgLoaded(true)
    }, 1000)
  }, [bgLoaded])

  useEffect(() => {
    if (!bgLoaded) {
      return
    }

    if (bgSprite >= 66) {
      setBgRev(true)
    } else if (bgSprite <= 1) {
      setBgRev(false)
    }

    if (bgRev) {
      requestAnimationFrame(() => setBgSprite(bgSprite - 1))
    } else {
      requestAnimationFrame(() => setBgSprite(bgSprite + 1))
    }
  }, [bgLoaded, bgSprite])

  const createTitleText = (text) => {
    let children = []
    let child = 0
    for (let i = 0; i < 60; i++) {
      if (i % 3 == 0) {
        child = 0
      } else {
        child++
      }
      children.push(<span>{text[child]}</span>)
    }

    return children
  }

  return (
    <div className="background">
      {bgCache[bgSprite]}
      <div className="stage">
        <Stage
          width={width}
          height={height}
          options={{ autoDensity: true, transparent: true }}>
          <JetFighter x={jetFighters[0].x} y={jetFighters[0].y} />
          <JetFighter x={jetFighters[0].x} y={jetFighters[0].y} />
        </Stage>
      </div>
      <h1 className="title">{createTitleText(titleText)}</h1>
    </div>
  )
}

render(<App />, document.getElementById('root'))
