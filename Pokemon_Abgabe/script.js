let score = 0;
let currentSet = 'day';
let pokeballUpgradeLevel = 0; // 0 = kein Upgrade, 1 = erstes, 2 = zweites Upgrade
let catchChance = 0.5;

const pokemonSets = {
    day: ['#pokemonModel1', '#pokemonModel2', '#pokemonModel3', '#pokemonModel4'],
    night: ['#pokemonModel5', '#pokemonModel6', '#pokemonModel7', '#pokemonModel8']
};

AFRAME.registerComponent('catch-pokemon', {
    init: function () {
        const el = this.el;

        el.addEventListener('click', () => {
            const scene = document.querySelector('a-scene');
            const pokeball = document.createElement('a-entity');
            const targetPosition = el.getAttribute('position');

            //Pokeball aussehen
            let pokeballModel = '#pokeballModel';
            if (pokeballUpgradeLevel === 1) pokeballModel = '#pokeballModelUpgrade1';
            else if (pokeballUpgradeLevel === 2) pokeballModel = '#pokeballModelUpgrade2'; 

            pokeball.setAttribute('gltf-model', pokeballModel);
            pokeball.setAttribute('position', '0 1.6 0');
            pokeball.setAttribute('scale', '0.07 0.07 0.07');

            pokeball.setAttribute('animation__throw', {
                property: 'position',
                to: targetPosition,
                dur: 1000,
                easing: 'easeOutExpo'
            });

            pokeball.addEventListener('animationcomplete__throw', () => {
                let currentCatchChance = 0.5;
                if (pokeballUpgradeLevel === 1) currentCatchChance = 0.75; //Hyperball
                else if (pokeballUpgradeLevel === 2) currentCatchChance = 1.0; //Meisterball

                const success = Math.random() < currentCatchChance;

                if (success) {
                    el.parentNode.removeChild(el);
                    score += 5;
                    document.querySelector('#scoreText').setAttribute('text', `value: Punkte: ${score}`);

                    // SOUND ABSPIELEN
                    const soundPlayer = document.querySelector('#soundPlayer');
                    if (soundPlayer && soundPlayer.components.sound) {
                        soundPlayer.components.sound.playSound();
                    }
                } else {
                    el.setAttribute('animation__escape', {
                        property: 'rotation',
                        dur: 300,
                        to: '0 0 30',
                        dir: 'alternate',
                        loop: 2
                    });
                }

                setTimeout(() => {
                    if (pokeball.parentNode) pokeball.parentNode.removeChild(pokeball);
                }, 1000);
            });

            scene.appendChild(pokeball);
        });
    }
});

AFRAME.registerComponent('look-at-camera', {
    init: function () {
        const camera = document.querySelector('#camera');
        if (!camera) return;
        const camPos = new THREE.Vector3();
        camera.object3D.getWorldPosition(camPos);
        this.el.object3D.lookAt(camPos);
    }
});

AFRAME.registerComponent('spawn-model', {
    schema: { set: { type: 'string', default: 'day' } },

    init: function () {
        this.spawnPokemon(this.data.set);
    },

    update: function () {
        this.clearPokemon();
        this.spawnPokemon(this.data.set);
    },

    clearPokemon: function () {
        const scene = document.querySelector('a-scene');
        const pokemons = scene.querySelectorAll('[gltf-model]');
        pokemons.forEach(p => {
            if (p.hasAttribute('catch-pokemon')) p.remove();
        });
    },

    spawnPokemon: function (set) {
        const scene = document.querySelector('a-scene');
        const models = pokemonSets[set] || [];
        const numPokemon = 10; //Wie viele Pokemon Spawnen

        for (let i = 0; i < numPokemon; i++) {
            const pokemon = document.createElement('a-entity');
            const model = models[Math.floor(Math.random() * models.length)];
            pokemon.setAttribute('gltf-model', model);
            pokemon.setAttribute('scale', '0.5 0.5 0.5');
            pokemon.setAttribute('catch-pokemon', '');
            pokemon.setAttribute('look-at-camera', '');

            const angle = Math.random() * Math.PI * 2;
            const distance = 5 + Math.random() * 5;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            const y = 0;

            pokemon.setAttribute('position', `${x} ${y} ${z}`);
            scene.appendChild(pokemon);
        }
    }
});

// Schnee & Sterne (deine Effekte)
AFRAME.registerComponent('snowflake', {
    tick: function (_time, timeDelta) {
        let pos = this.el.object3D.position;
        pos.y -= timeDelta * 0.001;
        if (pos.y < -1) {
            pos.y = Math.random() * 5 + 3;
            pos.x = Math.random() * 10 - 5;
            pos.z = Math.random() * 10 - 5;
        }
    }
});

AFRAME.registerComponent('star', {
    schema: { rotationSpeed: { default: 3 } },
    init: function () {
        this.el.addEventListener('mouseenter', () => {
            this.el.setAttribute('scale', '1.5 1.5 1.5');
            this.el.setAttribute('opacity', '1');
        });
        this.el.addEventListener('mouseleave', () => {
            this.el.setAttribute('scale', '1 1 1');
            this.el.setAttribute('opacity', '0.8');
        });
    },
    tick: function (time, timeDelta) {
        this.el.object3D.rotation.y += timeDelta * 0.001 * this.data.rotationSpeed;
    }
});

// Szenenwechsel und Upgrade-Button Logik
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#button');
    const sky = document.querySelector('#sky');
    const buttonText = document.querySelector('#buttonText');
    const effects = document.querySelector('#effect-container');
    const spawner = document.querySelector('#pokemon-spawner');
    const upgradeButton = document.querySelector('#upgradeButton');
    const upgradeText = document.querySelector('#upgradeText');
    const scoreText = document.querySelector('#scoreText');

    let isNight = false;
    let snowflakes = [], stars = [];

    function createSnowflakes() {
        for (let i = 0; i < 75; i++) {
            const flake = document.createElement('a-sphere');
            flake.setAttribute('position', `${Math.random() * 10 - 5} ${Math.random() * 5 + 2} ${Math.random() * 10 - 5}`);
            flake.setAttribute('color', '#ffffff');
            flake.setAttribute('radius', '0.05');
            flake.setAttribute('snowflake', '');
            effects.appendChild(flake);
            snowflakes.push(flake);
        }
    }

    function removeSnowflakes() {
        snowflakes.forEach(flake => effects.removeChild(flake));
        snowflakes = [];
    }

    function createStars() {
        for (let i = 0; i < 30; i++) {
            const star = document.createElement('a-image');
            star.setAttribute('position', `${Math.random() * 10 - 5} ${Math.random() * 5 + 2} ${Math.random() * 10 - 5}`);
            star.setAttribute('src', 'minior.png');
            star.setAttribute('width', '0.3');
            star.setAttribute('height', '0.3');
            star.setAttribute('rotation', '0 0 0');
            star.setAttribute('star', '');
            effects.appendChild(star);
            stars.push(star);
        }
    }

    function removeStars() {
        stars.forEach(star => effects.removeChild(star));
        stars = [];
    }

    // Szene wechseln
    button.addEventListener('click', () => {
        if (score < 20) {
            alert('Du brauchst mindestens 20 Punkte, um die Szene zu wechseln!');
            return;
        }

        if (!isNight) {
            sky.setAttribute('src', 'night.jpg');
            buttonText.setAttribute('value', 'Tag');
            removeSnowflakes();
            createStars();
            currentSet = 'night';
        } else {
            sky.setAttribute('src', 'wasser.jpg');
            buttonText.setAttribute('value', 'Nacht');
            removeStars();
            createSnowflakes();
            currentSet = 'day';
        }
        isNight = !isNight;
        spawner.setAttribute('spawn-model', 'set', currentSet);
    });

    // Upgrade-Button Text updaten
    function updateUpgradeButtonText() {
        if (pokeballUpgradeLevel === 0) {
            upgradeText.setAttribute('value', 'Upgrade 1 (25 Punkte)');
        } else if (pokeballUpgradeLevel === 1) {
            upgradeText.setAttribute('value', 'Upgrade 2 (35 Punkte)');
        } else {
            upgradeText.setAttribute('value', 'Max Upgrade erreicht');
        }
    }

    updateUpgradeButtonText();

    upgradeButton.addEventListener('click', () => {
        if (pokeballUpgradeLevel === 0) {
            if (score < 25) {
                alert('Du brauchst mindestens 25 Punkte für das Upgrade!');
                return;
            }
            score -= 25;
            pokeballUpgradeLevel = 1;
            alert('Upgrade 1 aktiviert! Fangchance jetzt 80%!');
        } else if (pokeballUpgradeLevel === 1) {
            if (score < 35) {
                alert('Du brauchst mindestens 35 Punkte für das nächste Upgrade!');
                return;
            }
            score -= 35;
            pokeballUpgradeLevel = 2;
            alert('Upgrade 2 aktiviert! Fangchance jetzt 100%!');
        } else {
            alert('Du hast das maximale Upgrade bereits!');
            return;
        }
        scoreText.setAttribute('text', `value: Punkte: ${score}`);
        updateUpgradeButtonText();
    });

    // Start mit Schnee
    createSnowflakes();
});
