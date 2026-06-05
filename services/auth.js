export async function register(dto) {
  const res = await fetch("https://camptn-backend-production.up.railway.app/auth/register", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Erreur  dinscription : ${res.status}`);
  }

  return res.json();
}


export async function login(dto){
    const res = await fetch("https://camptn-backend-production.up.railway.app/auth/login", {
        method: "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(dto),

    });
    if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Erreur  dinscription : ${res.status}`);
  }

  return res.json();


}