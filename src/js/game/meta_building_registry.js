import { gMetaBuildingRegistry } from "../core/global_registries";
import { createLogger } from "../core/logging";
import { T } from "../translations";
import { MetaAnalyzerBuilding } from "./buildings/analyzer";
import { MetaBalancerBuilding } from "./buildings/balancer";
import { MetaBeltBuilding } from "./buildings/belt";
import { MetaComparatorBuilding } from "./buildings/comparator";
import { MetaConstantSignalBuilding } from "./buildings/constant_signal";
import { MetaCutterBuilding } from "./buildings/cutter";
import { MetaDisplayBuilding } from "./buildings/display";
import { MetaFilterBuilding } from "./buildings/filter";
import { MetaHubBuilding } from "./buildings/hub";
import { MetaItemProducerBuilding } from "./buildings/item_producer";
import { MetaLeverBuilding } from "./buildings/lever";
import { MetaLogicGateBuilding } from "./buildings/logic_gate";
import { MetaMinerBuilding } from "./buildings/miner";
import { MetaMixerBuilding } from "./buildings/mixer";
import { MetaPainterBuilding } from "./buildings/painter";
import { MetaReaderBuilding } from "./buildings/reader";
import { MetaRotaterBuilding } from "./buildings/rotater";
import { MetaStackerBuilding } from "./buildings/stacker";
import { MetaStorageBuilding } from "./buildings/storage";
import { MetaTransistorBuilding } from "./buildings/transistor";
import { MetaTrashBuilding } from "./buildings/trash";
import { MetaUndergroundBeltBuilding } from "./buildings/underground_belt";
import { MetaVirtualProcessorBuilding } from "./buildings/virtual_processor";
import { MetaWireBuilding } from "./buildings/wire";
import { MetaWireTunnelBuilding } from "./buildings/wire_tunnel";
import { gBuildingVariants, registerBuildingVariant } from "./building_codes";
import { KEYMAPPINGS } from "./key_action_mapper";
import { defaultBuildingVariant, MetaBuilding } from "./meta_building";

const logger = createLogger("building_registry");

export function addVanillaBuildingsToAPI() {
    var vanillaBuildings = [
        MetaAnalyzerBuilding,
        MetaBalancerBuilding,
        MetaBeltBuilding,
        MetaComparatorBuilding,
        MetaConstantSignalBuilding,
        MetaCutterBuilding,
        MetaDisplayBuilding,
        MetaFilterBuilding,
        MetaHubBuilding,
        MetaItemProducerBuilding,
        MetaLeverBuilding,
        MetaLogicGateBuilding,
        MetaMinerBuilding,
        MetaMixerBuilding,
        MetaPainterBuilding,
        MetaReaderBuilding,
        MetaRotaterBuilding,
        MetaStackerBuilding,
        MetaStorageBuilding,
        MetaTransistorBuilding,
        MetaTrashBuilding,
        MetaUndergroundBeltBuilding,
        MetaVirtualProcessorBuilding,
        MetaWireBuilding,
        MetaWireTunnelBuilding,
    ];

    for (let i = 0; i < vanillaBuildings.length; i++) {
        shapezAPI.ingame.buildings[new vanillaBuildings[i]().getId()] = vanillaBuildings[i];
    }
}

export function initMetaBuildingRegistry() {
    for (const buildingClassKey in shapezAPI.ingame.buildings) {
        const buildingClass = shapezAPI.ingame.buildings[buildingClassKey];
        gMetaBuildingRegistry.register(buildingClass);
        /**
         * @type {MetaBuilding}
         */
        const buildingInstance = gMetaBuildingRegistry.findByClass(buildingClass);

        for (const variantId in buildingInstance.variants) {
            if (!buildingInstance.variants.hasOwnProperty(variantId)) continue;
            if (typeof variantId === "undefined") continue;
            const variant = buildingInstance.variants[variantId];
            const rotationVariants = variant.getRotationVariants();
            for (let i = 0; i < rotationVariants.length; i++) {
                let rotationVariant = rotationVariants[i];
                if (!Number.isInteger(rotationVariant)) rotationVariant = 0;
                registerBuildingVariant(buildingClass, buildingInstance, variantId, rotationVariant);
            }
        }
    }

    for (const key in gBuildingVariants) {
        const variant = gBuildingVariants[key];
        assert(variant.metaClass, "Variant has no meta: " + key);
    }

    // Check for valid keycodes
    if (G_IS_DEV) {
        gMetaBuildingRegistry.entries.forEach(metaBuilding => {
            const id = metaBuilding.getId();
            if (!["hub"].includes(id)) {
                if (!KEYMAPPINGS.buildings[id]) {
                    assertAlways(
                        false,
                        "Building " + id + " has no keybinding assigned! Add it to key_action_mapper.js"
                    );
                }

                if (!T.buildings[id]) {
                    assertAlways(false, "Translation for building " + id + " missing!");
                }

                if (!T.buildings[id].default) {
                    assertAlways(false, "Translation for building " + id + " missing (default variant)!");
                }
            }
        });
    }

    logger.log("Registered", gMetaBuildingRegistry.getNumEntries(), "buildings");
    logger.log("Registered", Object.keys(gBuildingVariants).length, "building codes");
}

/**
 * Once all sprites are loaded, propagates the cache
 */
export function initBuildingCodesAfterResourcesLoaded() {
    logger.log("Propagating sprite cache");
    for (const key in gBuildingVariants) {
        const variant = gBuildingVariants[key];

        variant.sprite = variant.metaInstance.getSprite(variant.rotationVariant, variant.variant);
        variant.blueprintSprite = variant.metaInstance.getBlueprintSprite(
            variant.rotationVariant,
            variant.variant
        );
        variant.silhouetteColor = variant.metaInstance.getSilhouetteColor(
            variant.variant,
            variant.rotationVariant
        );
    }
}
