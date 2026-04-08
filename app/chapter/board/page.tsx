import Image from 'next/image'

export default function BoardPage() {
  const members = [
    {
      name: 'Sean Brigham',
      title: 'President',
      image: '/images/board/sean-brigham.webp',
      bio: 'Sean is an Army Aviator and experienced military leader with a strong background in aviation operations, safety, and team leadership. Currently flying as a UH-60 Instructor Pilot but would love to build his own plane.',
    },
    {
      name: 'Billy Stewart',
      title: 'Vice President',
      image: '/images/board/billy-stewart.webp',
      bio: 'Billy is an active member of the chapter, including leading the Youth Aviation Program and teaching the sheet metal classes in Summer Camp. He built a Zenith 601XLB which he flies regularly.',
    },
    {
      name: 'John Murtaugh',
      title: 'Treasurer',
      image: '/images/board/john-murtaugh.webp',
      bio: 'An IT guy who likes to fly. Originally from upstate NY, he moved to Florida in 1998 where he learned to fly, then to Atlanta where he built a Vans RV-9A that he continues to enjoy today. Currently retired and active in the youth build program.',
    },
    {
      name: 'Pam Sidhi',
      title: 'Secretary',
      image: '/images/board/pam-sidhi.webp',
      bio: 'A proud mom, she blends strategy with heart to engage and strengthen the community and chapter.',
    },
    {
      name: 'Peter DiTomaso',
      title: 'At Large Member',
      image: '/images/board/peter-ditomaso.webp',
      bio: 'A Canadian by birth, Peter has been an active chapter member for many years, an avid Oshkosh attendee, and is currently building an RV-7.',
    },
    {
      name: 'Brian Falony',
      title: 'At Large Member',
      image: '/images/board/brian-falony.webp',
      bio: 'Brian is a retired marketing executive with a life-long interest in aviation. He currently serves as Young Eagles Coordinator for the chapter.',
    },
    {
      name: 'John Patchin',
      title: 'At Large Member',
      image: '/images/board/john-patchin.webp',
      bio: "John is part of the kitchen crew and helps cook for the Saturday breakfasts and events throughout the year. He's currently building a Van's RV-4 and owns a Sonex which is hangared at Winder Airport.",
    },
    {
      name: 'Jim Madeley',
      title: 'At Large Member',
      image: '/images/board/jim-madeley.webp',
      bio: 'Jim is a retired orthopedic surgeon, flies an RV-12, and participates regularly in chapter fly-outs to various southeastern venues.',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-eaa-blue mb-10 text-center">Chapter Leaders</h1>

      <div className="space-y-14 mb-16">
        {members.map((member, index) => (
          <article key={member.name} className="text-center">
            <div className="rounded-xl overflow-hidden shadow-md mb-4">
              <Image
                src={member.image}
                alt={`Portrait of ${member.name}, ${member.title}`}
                width={600}
                height={800}
                sizes="(max-width: 672px) 100vw, 672px"
                style={{ width: '100%', height: 'auto' }}
                {...(index === 0 ? { priority: true } : {})}
              />
            </div>
            <h2 className="text-2xl font-bold text-eaa-blue">{member.name}</h2>
            <p className="text-eaa-light-blue font-semibold mb-3">{member.title}</p>
            <p className="text-gray-700 leading-relaxed">{member.bio}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section aria-label="Board of Trustees" className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-eaa-blue mb-4">Board of Trustees</h2>
          <ul className="space-y-2 text-gray-700">
            <li>James Knight — Class of 2025&ndash;27</li>
            <li>Bill Miller — Class of 2024&ndash;26</li>
            <li>Chuck Roberts — Class of 2024&ndash;26</li>
            <li>Leonard Lowe — Class of 2023&ndash;25</li>
            <li>Ralph Kirkland — Class of 2023&ndash;25</li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">Two trustees are elected annually for 3-year terms.</p>
        </section>

        <section aria-label="Members of the Year" className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-eaa-blue mb-4">Members of the Year</h2>
          <ul className="space-y-2 text-gray-700">
            <li><span className="font-semibold">2025</span> — Brian Falony</li>
            <li><span className="font-semibold">2024</span> — Billy Stewart</li>
            <li><span className="font-semibold">2023</span> — Randy Woolery</li>
            <li><span className="font-semibold">2022</span> — Louis Pucci</li>
            <li><span className="font-semibold">2021</span> — Terry Hurst</li>
            <li><span className="font-semibold">2020</span> — John Post</li>
          </ul>
        </section>

        <section aria-label="Food Service" className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-eaa-blue mb-4">Food Service</h2>
          <ul className="space-y-2 text-gray-700">
            <li><span className="font-semibold">Pancake Breakfast:</span> Mark Ferguson (Co-Chair)</li>
            <li><span className="font-semibold">Special Events:</span> John Patchin (Co-Chair)</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
