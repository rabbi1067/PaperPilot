(function(){
    const canvas = document.getElementById('scene-canvas');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0f1c, 0.018);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 26);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // ---- lighting ----
    const hemi = new THREE.HemisphereLight(0x9fb4ff, 0x0a0f1c, 0.55);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffd9a0, 1.1);
    key.position.set(8, 12, 10);
    scene.add(key);
    const rim = new THREE.PointLight(0xffb454, 1.4, 60);
    rim.position.set(-6, 4, -6);
    scene.add(rim);

    // ---- starfield ----
    const starGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const starPos = new Float32Array(starCount*3);
    for(let i=0;i<starCount;i++){
        starPos[i*3] = (Math.random()-0.5)*160;
        starPos[i*3+1] = (Math.random()-0.5)*100;
        starPos[i*3+2] = (Math.random()-0.5)*160 - 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
    const starMat = new THREE.PointsMaterial({ color:0xffffff, size:0.35, transparent:true, opacity:0.7 });
    scene.add(new THREE.Points(starGeo, starMat));

    // ---- floating grid floor (flight-path grid) ----
    const grid = new THREE.GridHelper(140, 28, 0x2a3a5c, 0x16213a);
    grid.position.y = -9;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    scene.add(grid);

    // ---- paper airplane (folded custom geometry) ----
    function buildPaperPlane(){
        const group = new THREE.Group();
        const paperMat = new THREE.MeshStandardMaterial({
            color: 0xf2e9d3, roughness:0.55, metalness:0.05,
            side: THREE.DoubleSide, emissive:0x2a2013, emissiveIntensity:0.15
        });
        const foldMat = new THREE.MeshStandardMaterial({
            color: 0xd8c9a3, roughness:0.6, metalness:0.05,
            side: THREE.DoubleSide
        });

        function tri(v0,v1,v2, mat){
            const g = new THREE.BufferGeometry();
            const verts = new Float32Array([...v0, ...v1, ...v2]);
            g.setAttribute('position', new THREE.BufferAttribute(verts,3));
            g.computeVertexNormals();
            return new THREE.Mesh(g, mat);
        }

        group.add(tri([0,0,2.2],[0,0.4,-2.0],[2.6,-0.15,-1.1], paperMat));
        group.add(tri([0,0,2.2],[2.6,-0.15,-1.1],[0,-0.05,-1.4], foldMat));
        group.add(tri([0,0,2.2],[0,0.4,-2.0],[-2.6,-0.15,-1.1], paperMat));
        group.add(tri([0,0,2.2],[-2.6,-0.15,-1.1],[0,-0.05,-1.4], foldMat));
        group.add(tri([0,0,2.2],[0,0.4,-2.0],[0,0.9,-0.6], foldMat));

        group.scale.setScalar(1.15);
        return group;
    }
    const plane = buildPaperPlane();
    scene.add(plane);

    const echo = buildPaperPlane();
    echo.scale.setScalar(0.6);
    echo.traverse(o=>{ if(o.material){ o.material = o.material.clone(); o.material.transparent=true; o.material.opacity=0.35; }});
    scene.add(echo);

    // ---- flight path (closed loop spline) ----
    const pathPoints = [
        new THREE.Vector3(-14, 2, -6),
        new THREE.Vector3(-6, 6, 4),
        new THREE.Vector3(4, 3, 8),
        new THREE.Vector3(12, -2, 2),
        new THREE.Vector3(8, -5, -8),
        new THREE.Vector3(-2, -1, -12),
        new THREE.Vector3(-12, 1, -8),
    ];
    const curve = new THREE.CatmullRomCurve3(pathPoints, true, 'catmullrom', 0.6);

    const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(200));
    const lineMat = new THREE.LineBasicMaterial({ color:0xffb454, transparent:true, opacity:0.18 });
    scene.add(new THREE.Line(lineGeo, lineMat));

    // ---- floating research paper cards ----
    const cardGroup = new THREE.Group();
    const cardCount = 16;
    for(let i=0;i<cardCount;i++){
        const w = 1.3 + Math.random()*0.5;
        const h = w*1.35;
        const geo = new THREE.PlaneGeometry(w,h);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x0f1a30, roughness:0.7, metalness:0.1,
            side: THREE.DoubleSide, transparent:true, opacity:0.85,
            emissive: 0x142038, emissiveIntensity:0.4
        });
        const card = new THREE.Mesh(geo, mat);
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({ color:0x4a5d85, transparent:true, opacity:0.5 })
        );
        card.add(edges);

        const radius = 16 + Math.random()*14;
        const angle = Math.random()*Math.PI*2;
        const yy = (Math.random()-0.5)*20;
        card.position.set(Math.cos(angle)*radius, yy, Math.sin(angle)*radius - 10);
        card.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        card.userData.spin = (Math.random()-0.5)*0.15;
        card.userData.bob = Math.random()*Math.PI*2;
        cardGroup.add(card);
    }
    scene.add(cardGroup);

    window.addEventListener('resize', ()=>{
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const altEl = document.getElementById('alt');
    const hdgEl = document.getElementById('hdg');

    const clock = new THREE.Clock();
    const tmpPos = new THREE.Vector3();
    const tmpNext = new THREE.Vector3();

    function animate(){
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        const loopT = (t*0.035) % 1;
        curve.getPointAt(loopT, tmpPos);
        curve.getPointAt((loopT+0.01)%1, tmpNext);
        plane.position.copy(tmpPos);
        plane.lookAt(tmpNext);
        plane.rotateY(Math.PI/2);
        plane.rotation.z += Math.sin(t*1.4)*0.06;

        const echoT = (loopT - 0.02 + 1) % 1;
        curve.getPointAt(echoT, tmpPos);
        curve.getPointAt((echoT+0.01)%1, tmpNext);
        echo.position.copy(tmpPos);
        echo.lookAt(tmpNext);
        echo.rotateY(Math.PI/2);

        cardGroup.children.forEach(card=>{
            card.rotation.y += card.userData.spin*0.01;
            card.position.y += Math.sin(t*0.6 + card.userData.bob)*0.003;
        });

        camera.position.x = Math.sin(t*0.05)*4;
        camera.position.y = 3 + Math.sin(t*0.08)*1.2;
        camera.lookAt(0,0,-2);

        if(altEl && hdgEl && Math.floor(t*10)%5===0){
            const alt = (12000 + Math.sin(t*0.3)*400 + Math.random()*20).toFixed(0);
            altEl.textContent = Number(alt).toLocaleString() + ' FT';
            const hdg = (87 + Math.sin(t*0.15)*12).toFixed(0).padStart(3,'0');
            hdgEl.textContent = hdg + '\u00B0';
        }

        renderer.render(scene, camera);
    }
    animate();
})();