import {
  mediaItems,
  genreSections,
  getSectionHighlight,
  type MediaItem,
} from '@/data/interests';

const Interests = () => {
  const visibleSections = genreSections.filter((section) =>
    mediaItems.some((item) =>
      (section.types as readonly MediaItem['type'][]).includes(item.type)
    )
  );

  return (
    <div className="overflow-x-hidden bg-background pt-20 md:pt-24 flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-6 flex-grow">
        <section className="pt-8 pb-4 md:pt-12 md:pb-6 text-[15px] md:text-base leading-relaxed">
          <p className="mb-8 max-w-2xl text-foreground/70">
            Things I&apos;ve loved lately. It&apos;s a living list, so it keeps growing.
          </p>

          <div className="space-y-5 md:space-y-6">
            {visibleSections.map((section, sectionIndex) => {
              const items = mediaItems.filter((item) =>
                (section.types as readonly MediaItem['type'][]).includes(item.type)
              );
              return (
                <div key={section.id} className="min-w-0">
                  <div className="mb-4">
                    <h2
                      className={`inline-block rounded px-2.5 py-1 font-normal text-[15px] md:text-base ${getSectionHighlight(section.id)}`}
                    >
                      {section.label}
                    </h2>
                  </div>

                  <div className="overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)] pt-2 pb-2 scroll-smooth snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex w-max gap-3 pr-12 md:gap-4">
                      {items.map((item, itemIndex) => (
                        <MediaCard
                          key={item.id}
                          item={item}
                          square={section.id === 'music'}
                          landscape={item.shape === 'landscape'}
                          priority={sectionIndex === 0 && itemIndex < 4}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

function MediaCard({
  item,
  square,
  landscape,
  priority,
}: {
  item: MediaItem;
  square?: boolean;
  landscape?: boolean;
  priority?: boolean;
}) {
  const aspect = square
    ? 'aspect-square'
    : landscape
      ? 'aspect-[3/2]'
      : 'aspect-[2/3]';
  const width = landscape
    ? 'w-[200px] sm:w-[220px]'
    : 'w-[140px] sm:w-[156px]';

  const content = (
    <>
      <div className={`relative overflow-hidden rounded-xl bg-muted/50 transition-transform duration-300 ease-out md:group-hover:-translate-y-1 md:group-hover:scale-[1.02] ${aspect}`}>
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'low'}
            width={landscape ? 220 : 156}
            height={landscape ? 147 : square ? 156 : 234}
          />
        ) : (
          <div className="flex h-full w-full items-end p-3">
            <span className="line-clamp-4 text-[13px] leading-snug text-foreground/45">
              {item.title}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2.5">
        <div className="line-clamp-2 font-normal leading-snug text-foreground group-hover:underline group-hover:underline-offset-2">
          {item.title}
        </div>
        {item.author ? (
          <div className="mt-0.5 line-clamp-1 text-[13px] md:text-sm text-foreground/55 font-normal">
            {item.author}
          </div>
        ) : null}
      </div>
    </>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block shrink-0 snap-start ${width}`}
      >
        {content}
      </a>
    );
  }

  return <div className={`shrink-0 snap-start ${width}`}>{content}</div>;
}

export default Interests;
