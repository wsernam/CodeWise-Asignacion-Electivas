import axiosInstance from "./axiosInstance";


export interface IElective {
    id: string;
    name: string;
    description: string;
    credits: number;
}

export const getElectives =  async (): Promise<IElective[]> => {
    // const response = await axiosInstance.get<IElective[]>('/electives');
    const response = await getMockElectives();
    return response.status === 200 ? response.data : [];
}


const mockElectives: IElective[] = [
    {
        id: "1",
        name: "Introduction to Programming",
        description: "Learn the basics of programming using Python.",
        credits: 3,
    },
    {
        id: "2",
        name: "Data Structures and Algorithms",
        description: "Explore fundamental data structures and algorithms.",
        credits: 4,
    },
    {
        id: "3",
        name: "Web Development",
        description: "Build modern web applications using HTML, CSS, and JavaScript.",
        credits: 3,
    }
];


export const getMockElectives = async (): Promise<{ status: number; data: IElective[] }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                status: 200,
                data: mockElectives
            });
        }, 1000);
    });
}