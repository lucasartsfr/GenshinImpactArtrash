import { useEffect, useState } from 'react'
import './App.css'
import FireStoreParser from 'firestore-parser';
import Select from './components/Select';

function App() {

  const API = "https://api.lucasarts.fr/genshin/Characters.json";
  const FOLDER = "https://api.lucasarts.fr/genshin/";
  const ARTIFACT = "https://api.lucasarts.fr/genshin/Artifacts.json";

  const [data, setData] = useState();
  const [dataArte, setDataArte] = useState({Broken : "--- Broken SET ---"});
  const [load, setLoad] = useState(false);  
  const [info, setInfo] = useState({});
  const [useSet, setUseSet] = useState(false);
  const [dynamic, setDynamic] = useState({
    set : "Broken",
    arte : "Sablier",
    main : "PV",
    sub : ['TC', 'DC', 'ER', 'EM'],
  })


  const Title = {4 : "Parfait", 3 : "Très bien", 2 : "Bien", 1 : "Passable", 0 : "Mauvais"}
  const ListeSubStats = {
    // DCTC : "Dégat Crit/Taux Crit", 
    ATK : "Attaque %", 
    DEF : "Défense %", 
    PV : "PV %", 
    ER : "Recharge d'énergie",
    EM : "Maitrise élémentaire",
    DC : "Dégat Crit",
    TC : "Taux Crit",
    ATKF : "Attaque Flat",
    DEFF : "Défense Flat",
    PVF : "PV Flat"
  }
  const ListeArte = {
    Sablier : "Sablier",
    Coupe : "Coupe",
    Casque : "Casque",
    Fleur : "Fleur",
    Plume : "Plume"
  }
  const ListeMainStats = {
    Sablier :{
      ATK : "Attaque %", 
      DEF : "Défense %", 
      PV : "PV %", 
      ER : "Recharge d'énergie",
      EM : "Maitrise élémentaire",
    },
    Coupe : {
      ATK : "Attaque %", 
      DEF : "Défense %", 
      PV : "PV %", 
      EM : "Maitrise élémentaire",
      PHYSIC : "Bonus dégat Pysique",
      CRYO : "Bonus de dégat CRYO",
      ANEMO : "Bonus de dégat ANEMO",
      PYRO : "Bonus de dégat PYRO",
      ELECTRO : "Bonus de dégat ELECTRO",
      GEO : "Bonus de dégat GEO",
      HYDRO : "Bonus de dégat HYDRO",
      DENDRO : "Bonus de dégat DENDRO",
    },
    Casque : {
      ATK : "Attaque %", 
      DEF : "Défense %", 
      PV : "PV %", 
      EM : "Maitrise élémentaire",
      DC : "Dégat Crit",
      TC : "Taux Crit",
      SOIN : "Bonus de soin",
    },
    Fleur : {
      PVF : "PV Flat"
    },
    Plume : {
      ATKF : "Attaque Flat"
    }
  }

  useEffect(()=>{
    const fetchData = async () =>  {
      const Tmpdata = await fetch(API).then(response => response.json()).then(json => FireStoreParser(json['documents']))
      const TmpArte = await fetch(ARTIFACT).then(response => response.json()).then(json => FireStoreParser(json['documents']))
      Object.keys(TmpArte).map((nb) =>{
        const SET = TmpArte[nb].fields.Set;
        const NAME = TmpArte[nb].name.split('/').pop();
        dataArte[NAME] = SET
      })

      setData(Tmpdata);
      setDataArte({...dataArte})
      setLoad(true);
    };
    fetchData()  
  }, [])


  useEffect(() =>{
    setInfo({}) // Reset Info
  }, [dynamic]);



  // All Characters
  (load) && Object.keys(data).map((id) =>{
    const Name = data[id].name.split('/').pop();
    const Build = data[id].fields.Build;
    // Build of Character (1 or 2)
    const ReadBuild = Object.keys(Build).map((BuildId) =>{
      var Count = 0;
      var hasStat = []
      const MainStats = Build[BuildId].MainStats;
      const SubStats = Build[BuildId].SubStats;
      const ArteList = Object.values(Build[BuildId].Artifact).join().split(',');

      // If Good SET
      if(ArteList.includes(dynamic.set) || dynamic.set === "Broken"){
     
        // Character has The MainStat for Sablier/Coupe etC...
        if(MainStats[dynamic.arte]?.includes(dynamic.main) || dynamic.arte === "Fleur" || dynamic.arte === "Plume"){
          dynamic.sub.map((stat, index) => {
            // Check if Substat from character HAS Stat Selected
            const CheckTCDC = (stat === "TC" || stat === "DC") ? "DCTC" : stat;
            if(SubStats.includes(CheckTCDC)){
              // If not in Array, Then add
              if(!hasStat.includes(stat)){
                hasStat.push(stat);  
                Count++;
              }    
            }          
          })        
        }

      }


      // Save Info V2
      info[Count] = {  ...info[Count] };
      info[Count][Name] = {...info[Count][Name], Star : data[id].fields.Star };
      info[Count][Name]["Build"] = {...info[Count][Name].Build, [Build[BuildId].BuildName] : { Stat : hasStat } }// 
     
    })       
    return ReadBuild;
  });



  const ToAppend = (load) && Object.keys(info).reverse().map((number) =>{
    const nom = Object.keys(info[number]).map((chara) =>{      
    const Star = parseInt(info[number][chara].Star);
    const Build = Object.keys(info[number][chara].Build).map(x => 
      <div key={x} className='BuildData'><h5>{x}</h5><span>{info[number][chara].Build[x].Stat.join(", ")}</span></div>
    );

      return(
        <div key={number+"-"+chara} id={number+"-"+chara} className='Card'>
          <div className="TitleBuild">
            {Build}
          </div>
        <div className="Character" style={{ backgroundImage: `url("${FOLDER}Backgrounds/Star/${Star}.webp")`}}>
          <div className="CharacterImage">
            <img alt={chara} className="CharacterMini" width="256" height="256" layout="fixed" src={`${FOLDER}Characters/${chara}/mini.webp`} />
            {/* <img alt={Type} className="CharacterType" width={32} height={32} layout="fixed" src={`${FOLDER}Types/${Type}.png`} /> */}
          </div>
          <div className="CharacterName">
            <div id="top"></div>
            <span>{"⭐".repeat(Star)}</span>
            <h2>{chara}</h2>
          </div>
        </div>      
      </div>
      )
    })
    return (
    <div key={"liste-"+number} id={"liste-"+number} className="TeamContainer">
      <h4>Votre artéfact serait <b className='Info'>{Title[number]}</b> sur </h4>
      {nom}
    </div>)
  })

  // Function Change Select
  const UpdateInput = (e) => {
    const Val = e.target.value;        
    var split = e.currentTarget.id.split('.');    
    var last = split.pop();
    split.reduce((o,i) => o[i], dynamic)[last] = Val; 
    console.log(dynamic)
    setDynamic({...dynamic})
  }

  return (
    <div className="App">
      <h1>Should I use my artifact for Artifact Strongbox ?</h1>
      <h4>Dois-je utiliser mon artéfact pour créer un reliquaire ?</h4>
      <div className='FlexContainer'>
        <h4>Voir par SET ou en Borken Set ?</h4>
        {(load) && <Select Title="Set artéfact" Default="Broken" ToUpdate="set" Update={UpdateInput} Source={dataArte}></Select>}
      </div>

      <div className='FlexContainer'>
      <h4>MainStats</h4>
        <Select Title="Artéfact" Default="Sablier" ToUpdate="arte" Update={UpdateInput} Source={ListeArte}></Select>
        <Select Title="Main Stat" Default="PV" ToUpdate="main" Update={UpdateInput} Source={ListeMainStats[dynamic["arte"]]}></Select>
      </div>

      <div className='FlexContainer'>
        <h4>SubStats</h4>
        <Select Title="Substat 1" Default="TC" ToUpdate="sub.0"  Update={UpdateInput} Source={ListeSubStats}></Select>
        <Select Title="Substat 2" Default="DC" ToUpdate="sub.1"  Update={UpdateInput} Source={ListeSubStats}></Select>
        <Select Title="Substat 3" Default="ER" ToUpdate="sub.2" Update={UpdateInput} Source={ListeSubStats}></Select>
        <Select Title="Substat 4" Default="EM" ToUpdate="sub.3" Update={UpdateInput} Source={ListeSubStats}></Select>
      </div>

      {(!load) ? <div>Loading...</div> : ToAppend}
    </div>
  )
}

export default App
