/**
 * GearMath - Pure math functions for gear calculations
 */
var GearMath = {
    /**
     * Normalize an angle to [0, 2π)
     */
    normalizeAngle: function(angle) {
        angle = angle % (2 * Math.PI);
        if (angle < 0) angle += 2 * Math.PI;
        return angle;
    },

    /**
     * Calculate ring teeth for a valid planetary gearset.
     * Planetary constraint: R = S + 2P
     */
    planetaryRingTeeth: function(sunTeeth, planetTeeth) {
        return sunTeeth + 2 * planetTeeth;
    },

    /**
     * Calculate ring angular velocity from planetary constraint.
     * S×ωs + R×ωr = (S+R)×ωc  →  ωr = ((S+R)×ωc - S×ωs) / R
     *
     * @param {number} sunOmega - Sun angular velocity (signed)
     * @param {number} carrierOmega - Carrier angular velocity (signed)
     * @param {number} sunTeeth - Sun gear teeth
     * @param {number} ringTeeth - Ring gear teeth
     * @returns {number} Ring angular velocity (signed)
     */
    planetaryRingSpeed: function(sunOmega, carrierOmega, sunTeeth, ringTeeth) {
        return ((sunTeeth + ringTeeth) * carrierOmega - sunTeeth * sunOmega) / ringTeeth;
    },

    /**
     * Calculate ring phase from planet phase (internal mesh inversion).
     * For ring-planet internal mesh where both rotate same direction.
     *
     * @param {number} planetPhase - Planet gear phase offset
     * @param {number} meshAngle - Angle from ring center to planet center
     * @param {number} planetTeeth - Planet gear teeth
     * @param {number} ringTeeth - Ring gear teeth
     * @returns {number} Ring phase offset, normalized to [0, 2π)
     */
    calculateRingPhaseFromPlanet: function(planetPhase, meshAngle, planetTeeth, ringTeeth) {
        var halfToothPlanet = Math.PI / planetTeeth;
        var ratio = planetTeeth / ringTeeth;
        // Inverted internal mesh formula
        var offset = (planetPhase - halfToothPlanet) * ratio + meshAngle * (1 - ratio);
        return this.normalizeAngle(offset);
    },

    /**
     * Calculate the phase offset for a child gear meshing with a parent gear.
     *
     * @param {number} parentPhase - Parent gear's phase offset (radians)
     * @param {number} meshAngle - Angle from parent center to child center (radians)
     * @param {number} parentTeeth - Number of teeth on parent gear
     * @param {number} childTeeth - Number of teeth on child gear
     * @returns {number} Phase offset for child gear, normalized to [0, 2π)
     */
    calculateChildPhase: function(parentPhase, meshAngle, parentTeeth, childTeeth) {
        var ratio = parentTeeth / childTeeth;
        var halfTooth = Math.PI / childTeeth;
        // Derived from mesh condition: parent tooth meets child gap at contact point.
        var offset = halfTooth - Math.PI - meshAngle * (1 + ratio) - parentPhase * ratio;
        return this.normalizeAngle(offset);
    },

    /**
     * Calculate the phase offset for a gear meshing with an internal gear (ring).
     * Used when a smaller gear meshes with the inside of a ring gear.
     * Both gears rotate in the same direction for internal mesh.
     *
     * @param {number} parentPhase - Parent (ring) gear's phase offset (radians)
     * @param {number} meshAngle - Angle from ring center to child gear center (radians)
     * @param {number} parentTeeth - Number of teeth on parent (ring) gear
     * @param {number} childTeeth - Number of teeth on child gear
     * @returns {number} Phase offset for child gear, normalized to [0, 2π)
     */
    calculateInternalMeshPhase: function(parentPhase, meshAngle, parentTeeth, childTeeth) {
        var ratio = parentTeeth / childTeeth;
        var halfTooth = Math.PI / childTeeth;
        // For internal mesh: ring gap meets gear tooth at contact point.
        var offset = -halfTooth + meshAngle * (ratio - 1) + parentPhase * ratio;
        return this.normalizeAngle(offset);
    }
};

// Export for Node.js testing (if running in Node)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GearMath;
}
