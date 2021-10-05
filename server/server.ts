import { QBCore } from "./qbcore";
const exp = global.exports;

QBCore.Functions.CreateUseableItem("plate", (source, item) => {
  let Player = QBCore.Functions.GetPlayer(source)
  if (Player.PlayerData.job.name !== "mechanic") return emitNet("QBCore:Notify", source, "You do not have the skills to use this")
  
  emitNet("mojito_platechanger:client:openmenu", source)
})

onNet("mojito_licenseplate:server:apply", async (plate: string, netid: number) => {
  const src = global.source
  const veh = NetworkGetEntityFromNetworkId(netid)
  const oldplate = GetVehicleNumberPlateText(veh).trim()

  const result = await exp.oxmysql.scalarSync("SELECT COUNT(*) as count FROM `player_vehicles` WHERE `plate` = ?", [ plate ])

  if (result && result.count > 0) {
    return emitNet("QBCore:Notify", src, "This plate is already in use", "error")
  }

  const Player = QBCore.Functions.GetPlayer(src)
  if (Player.PlayerData.job.name !== "mechanic") {
    return emitNet("QBCore:Notify", src, "You are not skilled enough to use this", "error")
  }

  SetVehicleNumberPlateText(veh, plate)
  exp.oxmysql.execute("UPDATE `player_vehicles` SET `plate` = :plate WHERE `plate` = :old", {
    "plate": plate,
    "old": oldplate,
  })

  Player.Functions.RemoveItem("plate", 1)
})