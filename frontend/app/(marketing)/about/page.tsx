export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-black text-main-green mb-8">About MyCashNG</h1>
            <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                    MyCashNG is dedicated to simplifying the lending process for both lenders and borrowers.
                    Our platform provides the infrastructure needed to manage loans, track repayments, and ensure transparency.
                </p>
                <p>
                    We believe in financial inclusion and leveraging technology to create opportunities for everyone.
                </p>
            </div>
        </div>
    );
}
