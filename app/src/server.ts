// src/server.ts
interface FetchRequest {
    url: string;
    method: string;
    body?: any;
    headers?: { [key: string]: string };
}

interface FetchResponse {
    ok: boolean;
    status: number;
    json: () => Promise<any>;
    text?: () => Promise<string>;
}

async function simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
}

// --- Simulated Course Data ---
// In a real application, this would be stored in your database.
let simulatedCourses: string[] = [
    "Ciência da Computação",
    "Engenharia de Software",
    "Sistemas de Informação",
    "Análise e Desenvolvimento de Sistemas"
];


export async function serverFetch(request: FetchRequest): Promise<FetchResponse> {
    // await simulateDelay();

    const { url, method, body } = request;

    
    let response = await fetch(`api/v1${url}`, {
        body: JSON.stringify(body),
        method
    });
    console.log(`fetch(api/v1${url}) =>`, response);
    
    console.log("body:", body);
    
    console.log("body json:", JSON.stringify(body));
    
    console.log("method:", method);

    console.log("response:", response);

    return response;
}