import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import classes from "./css/Home.module.css";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CircleGeometry, color } from "three/webgpu";

const Home = () => {
  const canvasRef = useRef();

  useEffect(() => {
    //initialize the scene
    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath("/textures/cubeMap/");

    // sphere geometry for all the planets and moons
    const planetGeometry = new THREE.SphereGeometry(1, 32, 32);

    //lighting of the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1000);
    scene.add(pointLight);

    //adding the textures
    const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
    sunTexture.colorSpace = THREE.SRGBColorSpace;
    const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg");
    mercuryTexture.colorSpace = THREE.SRGBColorSpace;
    const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
    venusTexture.colorSpace = THREE.SRGBColorSpace;
    const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    const marsTexture = textureLoader.load("/textures/2k_mars.jpg");
    marsTexture.colorSpace = THREE.SRGBColorSpace;
    const moonTexture = textureLoader.load("/textures/2k_moon.jpg");
    moonTexture.colorSpace = THREE.SRGBColorSpace;

    // creating the sun
    const sunMesh = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(planetGeometry, sunMesh);
    sun.scale.setScalar(5);
    scene.add(sun);

    // add materials
    const mercuryMaterial = new THREE.MeshStandardMaterial({
      map: mercuryTexture,
    });
    const venusMaterial = new THREE.MeshStandardMaterial({
      map: venusTexture,
    });
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
    });
    const marsMaterial = new THREE.MeshStandardMaterial({
      map: marsTexture,
    });
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture,
    });

    // add a background to the scene
    const backgroundCubemap = cubeTextureLoader.load([
      "px.png",
      "nx.png",
      "py.png",
      "ny.png",
      "pz.png",
      "nz.png",
    ]);

    scene.background = backgroundCubemap;

    // all the planets in an array
    const planets = [
      {
        name: "Mercury",
        radius: 0.5,
        distance: 10,
        speed: 0.01,
        material: mercuryMaterial,
        moons: [],
      },
      {
        name: "Venus",
        radius: 0.8,
        distance: 15,
        speed: 0.007,
        material: venusMaterial,
        moons: [],
      },
      {
        name: "Earth",
        radius: 1,
        distance: 20,
        speed: 0.005,
        material: earthMaterial,
        moons: [
          {
            name: "Moon",
            radius: 0.3,
            distance: 3,
            speed: 0.015,
          },
        ],
      },
      {
        name: "Mars",
        radius: 0.7,
        distance: 25,
        speed: 0.003,
        material: marsMaterial,
        moons: [
          {
            name: "Phobos",
            radius: 0.1,
            distance: 2,
            speed: 0.02,
          },
          {
            name: "Deimos",
            radius: 0.2,
            distance: 3,
            speed: 0.015,
            color: 0xffffff,
          },
        ],
      },
    ];

    const createPlanet = (planet) => {
      const planetMesh = new THREE.Mesh(planetGeometry, planet.material);
      planetMesh.scale.setScalar(planet.radius);
      planetMesh.position.x = planet.distance;
      return planetMesh;
    };

    const createMoon = (moon) => {
      const moonMesh = new THREE.Mesh(planetGeometry, moonMaterial);
      moonMesh.scale.setScalar(moon.radius);
      moonMesh.position.x = moon.distance;
      return moonMesh;
    };

    const planetMeshes = planets.map((planet) => {
      const planetMesh = createPlanet(planet);
      scene.add(planetMesh);

      planet.moons.forEach((moon) => {
        const moonMesh = createMoon(moon);
        planetMesh.add(moonMesh);
      });
      return planetMesh;
    });

    //initialize the cemra
    const cemra = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cemra.position.z = 50;
    cemra.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

    //instantiate the controls
    const controls = new OrbitControls(cemra, canvasRef.current);
    controls.enableDamping = true;
    controls.maxDistance = 200;
    controls.minDistance = 20;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    window.addEventListener("resize", () => {
      cemra.aspect = window.innerWidth / window.innerHeight;
      cemra.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // initialize the clock
    const clock = new THREE.Clock();
    let previousTime = 0;

    const renderloop = () => {
      let currentTime = clock.getElapsedTime();
      const delta = currentTime - previousTime;
      previousTime = currentTime;

      sun.rotation.y += delta * THREE.MathUtils.degToRad(1) * 20;

      planetMeshes.forEach((planet, planetIndex) => {
        planet.rotation.y += planets[planetIndex].speed;
        planet.position.x =
          Math.sin(planet.rotation.y) * planets[planetIndex].distance;
        planet.position.z =
          Math.cos(planet.rotation.y) * planets[planetIndex].distance;
        planet.children.forEach((moon, moonIndex) => {
          moon.rotation.y += planets[planetIndex].moons[moonIndex].speed;
          moon.position.x =
            Math.sin(moon.rotation.y) *
            planets[planetIndex].moons[moonIndex].distance;
          moon.position.z =
            Math.cos(moon.rotation.y) *
            planets[planetIndex].moons[moonIndex].distance;
        });
      });

      controls.update();
      renderer.render(scene, cemra);
    };
    renderer.setAnimationLoop(renderloop);
  });

  return (
    <>
      <div className={classes.main}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </>
  );
};

export default Home;
