import React from 'react'
import { useEffect, useState } from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'
import Marquee from 'react-marquee-slider'
import times from 'lodash/times'

import './global.css'

import soundFile from './franchise.mp3'

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: #8bf4a7;
`

const BackgroundImage = styled.img`
  mix-blend-mode: multiply;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
`

const MarqueeContainer = styled.div`
  position: absolute;
  bottom: 20%;
  left: 0;
`

const Title = styled.span`
  font-size: 100px;
  color: #fff;
`

const OddSpan = styled.span`
  -webkit-text-stroke: 2px white;
  -webkit-text-fill-color: transparent;
`

const App = () => {
  const [bgSprite, setBgSprite] = useState(1)
  const [bgCache, setBgCache] = useState([])
  const [bgLoaded, setBgLoaded] = useState(false)
  const [bgRev, setBgRev] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  let audioData
  let audioFile
  const frequencyBandArray = [...Array(25).keys()]

  useEffect(() => {
    console.log('loading images...')
    let img

    for (let i = 0; i < 67; i++) {
      const bgCacheNow = bgCache
      const src = `/bg/tscott_crowdloop0${i}.jpg`
      img = new Image()
      img.src = src
      bgCacheNow.push(src)
      setBgCache(bgCacheNow)
    }

    img.onload = () => {
      setTimeout(() => {
        console.log('images loaded.')
        setBgLoaded(true)
      }, 2000)
    }
  }, [bgLoaded])

  useEffect(() => {
    if (!bgLoaded) {
      return
    }

    if (bgSprite >= 65) {
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

  function startAudio() {
    console.log('starting audio')
    audioFile = new Audio()
    const audioContext = new AudioContext()
    const source = audioContext.createMediaElementSource(audioFile)
    const analyser = audioContext.createAnalyser()
    const gain = audioContext.createGain()
    audioFile.src = soundFile
    analyser.fftSize = 64
    gain.gain.value = 0.3
    source.connect(gain)
    gain.connect(audioContext.destination)
    source.connect(analyser)
    audioFile.play()
    audioData = analyser
    setAudioLoaded(true)
    setTimeout(analyze, 2000)
  }

  function analyze() {
    console.log('now!')
    const bufferLength = audioData.frequencyBinCount
    const amplitudeArray = new Uint8Array(bufferLength)
    audioData.getByteFrequencyData(amplitudeArray)
    console.log(amplitudeArray)
    requestAnimationFrame(analyze)
  }

  let titleStyleOrder = 0

  return (
    <Background onClick={() => startAudio()}>
      <BackgroundImage src={bgCache[bgSprite]} />
      <MarqueeContainer>
        <Marquee velocity={25}>
          {times(10, String).map((id) => {
            let text = []
            if (Math.abs(titleStyleOrder % 2) == 1) {
              text = [
                <span>FRANCHISE</span>,
                <OddSpan>TRAVIS</OddSpan>,
                <span>SCOTT</span>,
              ]
            } else {
              text = [
                <OddSpan>FRANCHISE</OddSpan>,
                <span>TRAVIS</span>,
                <OddSpan>SCOTT</OddSpan>,
              ]
            }
            titleStyleOrder++
            return <Title>{text}</Title>
          })}
        </Marquee>
      </MarqueeContainer>
    </Background>
  )
}

render(<App />, document.getElementById('root'))
