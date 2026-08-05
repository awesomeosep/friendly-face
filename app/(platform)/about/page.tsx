"use client";

export default function DashboardPage() {
  return (
    <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24">
      <div className="flex flex-col w-full gap-4 max-w-md px-8">
        <div className="flex flex-col max-w-full gap-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl">About</h1>
            <p>FriendlyFace is a web app platform to connect people with similar interest at lunch.</p>
            <p>{"With technology and social media, young people are more disconnected in-person than ever. We recognize that it can be difficult to find and connect with like-minded individuals."}</p>
            <p>We strive to create an open, inclusive space where people can fnd each other and build meaningful connections.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
