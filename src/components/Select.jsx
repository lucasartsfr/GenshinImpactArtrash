
export default function Select({Source, Update, ToUpdate, Default, Title}){


    const Options = Object.keys(Source).map((data, index) =>{
        return <option key={data+" "+index} value={data}>{Source[data]}</option>
    })
    
    return(
        <div className="InputContainer">
            <span className="Detail">{Title} <b className="StarDeco">✦</b></span>
            <select defaultValue={Default} key={ToUpdate} id={ToUpdate} onChange={Update}>
            {Options}
            </select>        
        </div>
    )
}