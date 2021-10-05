import { QBCore } from './qbcore'
import { Game, Entity } from 'fivem-js'

onNet("mojito_platechanger:client:openmenu", () => {
  const Ply = Game.PlayerPed
  const [Veh, Dist] = QBCore.Functions.GetClosestVehicle(Ply.Position)

  if (Veh) {
    console.log(Dist)
    if (Dist <= 5.0) {
      emit("nh-context:sendMenu", [
        {
          id: 1,
          header: "License Plate",
          txt: ""
        },
        {
          id: 2,
          header: "Set Plate Text",
          params: {
            event: "mojito_licenseplate:client:update"
          },
          txt: ""
        },
        {
          id: 3,
          header: "Apply Plate",
          params: {
            event: "mojito_licenseplate:client:apply"
          },
          txt: ""
        }
      ])
    } else {
      QBCore.Functions.Notify("You are too far away from this vehicle", "error", 5000)
    }
  } else {
    QBCore.Functions.Notify("There are no vehicles nearby", "error", 5000)
  }
})

let CURRENT_PLATE: string = "ABCD123"

declare interface KeyboardInput {
  input: string,
  _id?: number
}

const TakeInput = async (): Promise<string> => {
  const keyboard: KeyboardInput[] = await global.exports["nh-keyboard"].KeyboardInput({
    header: "Enter Plate Text", 
    rows: [
        {
          id: 0, 
          txt: "Spawn Name"
        }
    ]
  })

  if (keyboard.length > 0) {
    return keyboard[0].input
  }
  return CURRENT_PLATE
}

on("mojito_licenseplate:client:update", async () => {
  CURRENT_PLATE = await TakeInput()
  console.log(CURRENT_PLATE)
})

on("mojito_licenseplate:client:apply", () => {
  const Ply = Game.PlayerPed
  const [Veh, Dist] = QBCore.Functions.GetClosestVehicle(Ply.Position)

  if (Veh) {
    if (Dist >= 5.0) return QBCore.Functions.Notify("This vehicle is too far away", "inform", 5000) 

    emitNet("mojito_licenseplate:server:apply", CURRENT_PLATE, NetworkGetNetworkIdFromEntity(Veh))
  } else {
    QBCore.Functions.Notify("There are no vehicles nearby", "error", 5000)
  }
})