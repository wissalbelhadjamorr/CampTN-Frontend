export async function register(dto) {
  const res = await fetch("http://localhost:3000/auth/register", {
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
    const res = await fetch("http://localhost:3000/auth/login", {
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