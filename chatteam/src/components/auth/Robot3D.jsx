// src/components/auth/Robot3D.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Robot3D
 * - Self-contained Three.js component that mounts its own canvas.
 * - Looks at mouse cursor (pointer or global mouse).
 * - Smooth, cute motion with blink & pupil tracking.
 *
 * Usage:
 *   <Robot3D className="w-full h-[360px]" />
 */
export default function Robot3D({ className = "w-full h-full", style = {} }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Clear container
    container.innerHTML = "";

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0); // transparent
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 1.6, 9);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 8, 6);
    const rim = new THREE.PointLight(0xff9de2, 0.08, 30);
    rim.position.set(-6, 3.5, -5);
    scene.add(ambient, key, rim);

    // Materials
    const primaryMat = new THREE.MeshStandardMaterial({ color: 0x7c5cff, metalness: 0.18, roughness: 0.28 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xa78bfa, metalness: 0.08, roughness: 0.28 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0b1220, metalness: 0.05, roughness: 0.6 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x9ef6ff, emissive: 0x9ef6ff, emissiveIntensity: 0.9 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x002b2b });

    // Robot root
    const robot = new THREE.Group();
    scene.add(robot);

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 3.2, 1.4), primaryMat);
    body.position.set(0, -0.35, 0);
    robot.add(body);

    // Head group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.05, 0);
    robot.add(headGroup);

    const head = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 1.2), accentMat);
    headGroup.add(head);

    // Eyes + pupils
    const eyeL = new THREE.Group();
    const eyeR = new THREE.Group();
    const eyeGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const pupilGeo = new THREE.SphereGeometry(0.08, 12, 12);

    const eyeMeshL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeMeshR = eyeMeshL.clone();
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    const pupilR = pupilL.clone();

    eyeL.add(eyeMeshL, pupilL);
    eyeR.add(eyeMeshR, pupilR);

    eyeL.position.set(-0.48, 0.12, 0.66);
    eyeR.position.set(0.48, 0.12, 0.66);
    headGroup.add(eyeL, eyeR);

    // Antenna
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 12), darkMat);
    const antennaBall = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), eyeMat);
    antenna.position.set(0, 1.1, 0);
    antennaBall.position.set(0, 1.36, 0);
    headGroup.add(antenna, antennaBall);

    // Arms (grouped)
    const leftShoulder = new THREE.Group();
    const rightShoulder = new THREE.Group();

    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.45, 0.6), accentMat);
    upperArm.position.set(0, -0.55, 0);
    const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.3, 0.48), primaryMat);
    lowerArm.position.set(0, -1.25, 0);

    leftShoulder.add(upperArm.clone(), lowerArm.clone());
    rightShoulder.add(upperArm.clone(), lowerArm.clone());
    leftShoulder.position.set(-1.95, 0.7, 0);
    rightShoulder.position.set(1.95, 0.7, 0);
    robot.add(leftShoulder, rightShoulder);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.64, 1.5, 0.8), darkMat);
    const rightLeg = leftLeg.clone();
    leftLeg.position.set(-0.6, -2.15, 0);
    rightLeg.position.set(0.6, -2.15, 0);
    robot.add(leftLeg, rightLeg);

    // Shadow
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.12, transparent: true }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -3.02;
    scene.add(shadow);

    // initial scale
    robot.scale.setScalar(1.15);

    // state for smoothing
    const state = { headYaw: 0, headPitch: 0, leftArm: 0, rightArm: 0, bodyBob: 0, robotY: 0, robotRotY: 0, pupilX: 0, pupilY: 0, blink: 0 };
    const lerp = (a, b, f) => a + (b - a) * f;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // mouse state
    const mouse = { x: 0, y: 0, over: false };

    // pointer handlers
    function getNormalizedPointer(clientX, clientY) {
      const r = container.getBoundingClientRect();
      const x = (clientX - r.left) / r.width; // 0..1
      const y = (clientY - r.top) / r.height; // 0..1
      // convert to -1..1 and invert Y
      return { nx: (x - 0.5) * 2, ny: (0.5 - y) * 2 };
    }

    function onPointer(e) {
      const c = getNormalizedPointer(e.clientX ?? (e.touches && e.touches[0]?.clientX), e.clientY ?? (e.touches && e.touches[0]?.clientY));
      mouse.x = clamp(c.nx, -1, 1);
      mouse.y = clamp(c.ny, -1, 1);
      mouse.over = true;
    }

    function onLeave() {
      mouse.over = false;
    }

    // global fallback so it still follows cursor if outside container
    function onWindowMove(e) {
      const r = container.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const nx = (x / r.width - 0.5) * 2;
      const ny = (0.5 - y / r.height) * 2;
      mouse.x = clamp(nx, -1, 1);
      mouse.y = clamp(ny, -1, 1);
      mouse.over = true;
    }

    container.style.touchAction = "none";
    container.addEventListener("pointermove", onPointer, { passive: true });
    container.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("mousemove", onWindowMove);

    // Blink scheduling
    let lastBlink = 0;
    function scheduleBlink(t) {
      if (t - lastBlink > 1.8 + Math.random() * 2.7) {
        lastBlink = t;
        state.blink = 1;
      }
    }

    const clock = new THREE.Clock();
    let rafId = null;

    // Resize observer
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 300;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    function animate() {
      const t = clock.getElapsedTime();

      scheduleBlink(t);

      // Procedural targets
      const baseYaw = Math.sin(t * 0.6) * 0.12;
      const basePitch = Math.sin(t * 0.45) * 0.06;
      const leftArmTarget = Math.sin(t * 1.9) * 0.5 - 0.12;
      const rightArmTarget = -Math.sin(t * 1.9) * 0.5 + 0.12;
      const bodyBobTarget = Math.sin(t * 1.05) * 0.06;
      const robotYTarget = Math.sin(t * 0.8) * 0.04;
      const robotRotTarget = Math.sin(t * 0.12) * 0.03;

      // mouse influence (scaled)
      const lookYaw = mouse.over ? mouse.x * 0.6 : 0;
      const lookPitch = mouse.over ? mouse.y * 0.35 : 0;

      // pupils: follow mouse more subtly
      const pupilTargetX = mouse.over ? mouse.x * 0.12 : Math.sin(t * 0.9) * 0.03;
      const pupilTargetY = mouse.over ? mouse.y * 0.06 : Math.cos(t * 0.7) * 0.02;

      // combine and smooth
      state.headYaw = lerp(state.headYaw, baseYaw + lookYaw, 0.14);
      state.headPitch = lerp(state.headPitch, basePitch + lookPitch, 0.12);
      state.leftArm = lerp(state.leftArm, leftArmTarget, 0.12);
      state.rightArm = lerp(state.rightArm, rightArmTarget, 0.12);
      state.bodyBob = lerp(state.bodyBob, bodyBobTarget, 0.06);
      state.robotY = lerp(state.robotY, robotYTarget, 0.06);
      state.robotRotY = lerp(state.robotRotY, robotRotTarget, 0.04);
      state.pupilX = lerp(state.pupilX, pupilTargetX, 0.18);
      state.pupilY = lerp(state.pupilY, pupilTargetY, 0.18);

      // apply transforms
      headGroup.rotation.y = state.headYaw;
      headGroup.rotation.x = state.headPitch;

      leftShoulder.rotation.z = state.leftArm;
      rightShoulder.rotation.z = state.rightArm;

      body.position.y = -0.35 + state.bodyBob;
      robot.position.y = state.robotY;
      robot.rotation.y = state.robotRotY;

      // pupils follow
      pupilL.position.x = state.pupilX;
      pupilL.position.y = state.pupilY;
      pupilR.position.x = state.pupilX;
      pupilR.position.y = state.pupilY;

      // blink animation
      if (state.blink > 0) {
        state.blink = lerp(state.blink, 0, 0.36);
        const b = clamp(state.blink, 0, 1);
        const eyeScale = 1 - Math.sin(b * Math.PI) * 0.96;
        eyeMeshL.scale.y = eyeScale;
        eyeMeshR.scale.y = eyeScale;
        pupilL.scale.y = eyeScale;
        pupilR.scale.y = eyeScale;
      } else {
        eyeMeshL.scale.y = lerp(eyeMeshL.scale.y, 1, 0.12);
        eyeMeshR.scale.y = lerp(eyeMeshR.scale.y, 1, 0.12);
        pupilL.scale.y = lerp(pupilL.scale.y, 1, 0.12);
        pupilR.scale.y = lerp(pupilR.scale.y, 1, 0.12);
      }

      // antenna pulse
      const pulse = 0.6 + Math.abs(Math.sin(t * 3.0)) * 0.7;
      antennaBall.material.emissiveIntensity = Math.max(0.18, pulse * 0.35);
      eyeMeshL.material.emissiveIntensity = pulse;
      eyeMeshR.material.emissiveIntensity = pulse;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup on unmount
    return () => {
      ro.disconnect();
      container.removeEventListener("pointermove", onPointer);
      container.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("mousemove", onWindowMove);
      if (rafId) cancelAnimationFrame(rafId);
      if (container && renderer.domElement) container.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);

  return <div ref={mountRef} className={className} style={style} />;
}
