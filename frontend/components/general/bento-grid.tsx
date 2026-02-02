import Image from "next/image";

const grids = [
    {
        bottomBg: "#f1f6ed",
        hoverBg: "#e8f0e4",
    },
    {
        bottomBg: "#f1f6ed",
        hoverBg: "#e8f0e4",
    },
];

const BentoDesign = () => {
    return (
        <div className="flex justify-between absolute top-1/2 w-3/4 mx-auto -translate-y-1/2 left-1/2 -translate-x-1/2 z-0  items-center gap-6">

            <Image src={"/bento.svg"} alt="bento-grid" width={300} height={300} className="w-[300px] h-[300px]" />
            <Image src={"/bento.svg"} alt="bento-grid" width={300} height={300} className="w-[300px] h-[300px]" />

        </div>
    );
};

export default BentoDesign;