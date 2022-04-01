const { readFile, copyFileSync } = require("fs");
const proc = require("child_process");
const { sync } = require("glob");
const { resolve } = require('path');
const fetch = require("node-fetch");
const oldPPS = new Map();
const newPPS = new Map();
const oldPPSTX = new Map();
const newPPSTX = new Map();
const cooldown = new Map();
const check60 = new Map();
const PPS = "15000"

    async function po() {
        const intFile = await sync(resolve('/sys/class/net/tap**/statistics/rx_packets'));
        intFile.forEach((filepath) => {
            check(filepath, oldPPS)
            setTimeout(() => {check(filepath, newPPS)}, 1000);
        })
    }

    async function pu() {
        const intFile = await sync(resolve('/sys/class/net/tap**/statistics/tx_packets'));
        intFile.forEach((filepath) => {
            check(filepath, oldPPSTX)
            setTimeout(() => {check(filepath, newPPSTX)}, 1000);
        })
    }


    function check60s(params) {
        if(!check60.get(params)) return;
        let diff = Date.now() - check60.get(params)
        console.log(diff, "résultat bg")
        if(diff > 60000){return true;} else {return false;}
    }

    setInterval(async() => {
        await pu()
        await po()
        if(oldPPS && newPPS){
            oldPPS.forEach((element, item)=>{
                newPPS.forEach((elem,tiem)=>{
                    if(item === tiem){
                        let result = elem - element
                        item = item.replace("tap", "")
                        item = item.replace("i0", "")
                        item = item.replace("i1", "")
                        console.log(check60s(item), `VMID ${item}`)
                        if(result < PPS && cooldown.has(item) && check60.has(item)){
                            back(item, result)
                            setTimeout(() => {
                                cooldown.delete(item);
                            }, 1000 * 60 * 5);
                            console.log(`VMID ${item}`, "Fin d'attaque")
                            check60.delete(item)
                        }else if (result > PPS && check60.has(item) && check60s(item) === true && !cooldown.has(item)){
                            console.log(item, "Message envoyé")
                            cooldown.set(item, "cooldown")
                            send(item, result, "Sortant");
                        } else if(result > PPS && !cooldown.has(item) && !check60.has(item)){
                            check60.set(item, Date.now())
                            console.log(`VMID ${item}`,"Attaque détectée")
                        }
                        console.log(`${result} ${item}`)
                        console.log(check60)
                        console.log(cooldown, "cooldown")
                    }
                })
            })
        }

        if(oldPPSTX && newPPSTX){
                oldPPSTX.forEach((element, item)=>{
                    newPPSTX.forEach((elem,tiem)=>{
            if(item === tiem){
                let result = elem - element
                item = item.replace("tap", "")
                item = item.replace("i0", "")
                item = item.replace("i1", "")
                console.log(check60s(item), `VMID ${item}`)
                if(result < PPS && cooldown.has(item) && check60.has(item)){
                    back(item, result)
                    setTimeout(() => {
                        cooldown.delete(item);
                    }, 1000 * 60 * 5);
                    console.log(`VMID ${item}`, "Fin d'attaque")
                    check60.delete(item)
                }else if (result > PPS && check60.has(item) && check60s(item) === true && !cooldown.has(item)){
                    console.log(item, "Message envoyé")
                    cooldown.set(item, "cooldown")
                    send(item, result, "Entrant");
                } else if(result > PPS && !cooldown.has(item) && !check60.has(item)){
                    check60.set(item, Date.now())
                    console.log(`VMID ${item}`,"Attaque détectée")
                }
                console.log(`${result} ${item}`)
                console.log(check60)
                console.log(cooldown, "cooldown")
            }
                    })
                })
        }
    }, 5000);

    async function check(params, map) {
        readFile(params, 'utf-8', function(err,data) {
            params = params.replace("/sys/class/net/","")
            params = params.replace("/statistics/tx_packets","")
            params = params.replace("/statistics/rx_packets","")
            data = data.replace("\n","")
            if(data > PPS){
                map.set(params,data)
            }
        })
    }
    
    async function send(params, pps, pog) {     
           const resp = await fetch('https://discord.com/api/webhooks/914270933437513770/0BVQJ_ovQPQZ7C8i2YY6Yzma9tMstinWID8A1AfLcaGGAkcV3rnGrir6OMlsNNfeFHB0',
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                body: JSON.stringify({
                    username: "AdKy'Protect",
                    avatar_url:'https://cdn.discordapp.com/avatars/538723541047312415/24a2a452a60d6cb01fcaa76382ab6d81.png',
                    embeds: [{
                            color: 3845859,
                            title: `Attaque DDOS - ${pog} - VPS SSD 1`,
                            description: `Attaque suspectée sur la VMID ${params}\n\nAvec ${pps} PPS (limite fixée : ${PPS})`
                            }],
                    }),
                }
            );
            console.log(resp.status, resp.statusText);
    }

    async function back(params, pps) {      
        const resp = await fetch('https://discord.com/api/webhooks/914270933437513770/0BVQJ_ovQPQZ7C8i2YY6Yzma9tMstinWID8A1AfLcaGGAkcV3rnGrir6OMlsNNfeFHB0',
             {
                 method: 'post',
                 headers: {
                     'Content-Type': 'application/json',
                 },
             body: JSON.stringify({
                 username: "AdKy'Protect",
                 avatar_url:'https://cdn.discordapp.com/avatars/538723541047312415/24a2a452a60d6cb01fcaa76382ab6d81.png',
                 embeds: [{
                         color: 3729475,
                         title: 'Attaque DDOS terminée - VPS SSD 1',
                         description: `Attaque sur la VMID ${params} terminée\n\nAvec ${pps} PPS actuellement (limite fixée : ${PPS})`
                         }],
                 }),
             }
         );
         console.log(resp.status, resp.statusText);
 }