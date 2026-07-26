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
    <div className="min-h-screen overflow-x-hidden bg-background pt-24 flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 flex-grow">
        <section className="py-8 md:py-12 text-[15px] md:text-base leading-relaxed">
          <p className="mb-8 max-w-2xl text-foreground/70">
            Everything I&apos;m currently consuming and have loved very much. (I'm aiming for this to be a large, living library of content I consume. Stay tuned!)
          </p>

          <div className="space-y-5 md:space-y-6">
            {visibleSections.map((section) => {
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

                  <div className="overflow-x-auto pt-2 pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin]">
                    <div className="flex w-max gap-3 pr-4 md:gap-4 md:pr-6">
                      {items.map((item) => (
                        <MediaCard
                          key={item.id}
                          item={item}
                          square={section.id === 'music'}
                          landscape={item.type === 'book' && item.description === 'Essay'}
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
}: {
  item: MediaItem;
  square?: boolean;
  landscape?: boolean;
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
            loading="lazy"
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
