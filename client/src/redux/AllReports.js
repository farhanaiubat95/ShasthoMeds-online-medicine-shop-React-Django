// Example React call
const fetchReport = async (filter, startDate=null, endDate=null, exportType=null) => {
  let url = `/api/orders-report/?filter=${filter}`;
  if(startDate && endDate){
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }
  if(exportType){
    url += `&export=${exportType}`;
    window.open(url, "_blank"); // download CSV
    return;
  }
  const res = await axios.get(url);
  console.log(res.data); // render table
}
